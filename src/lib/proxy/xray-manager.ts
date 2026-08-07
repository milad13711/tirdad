import "server-only";
import { spawn, execFile, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile, chmod, access } from "node:fs/promises";
import path from "node:path";
import { parseVpnConfig, VpnConfigParseError } from "./vless-vmess-parser";

const execFileAsync = promisify(execFile);

// Everything lives under .data/xray so it survives redeploys that only
// replace the app source (the deploy script keeps the working directory,
// only .env is explicitly preserved — this directory is created fresh if
// missing, and the binary is only re-downloaded when absent).
const DATA_DIR = path.join(process.cwd(), ".data", "xray");
const BINARY_PATH = path.join(DATA_DIR, "xray");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");
const XRAY_VERSION = process.env.XRAY_VERSION || "1.8.24";
const PROXY_PORT = 10809;
export const PROXY_URL = `http://127.0.0.1:${PROXY_PORT}`;

async function fileExists(p: string) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

// Downloads the official Xray-core linux-64 release and extracts just the
// `xray` binary via the system `unzip` (present on essentially every
// Ubuntu/Debian server; this repo doesn't add a zip-extraction npm
// dependency just for a one-time setup step).
async function ensureBinary() {
  if (await fileExists(BINARY_PATH)) return;

  await mkdir(DATA_DIR, { recursive: true });
  const zipUrl = `https://github.com/XTLS/Xray-core/releases/download/v${XRAY_VERSION}/Xray-linux-64.zip`;
  const zipPath = path.join(DATA_DIR, "xray.zip");

  const response = await fetch(zipUrl);
  if (!response.ok) {
    throw new Error(`دانلود Xray-core ناموفق بود (${response.status})`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(zipPath, buffer);

  await execFileAsync("unzip", ["-o", zipPath, "xray", "-d", DATA_DIR]);
  await chmod(BINARY_PATH, 0o755);
}

function buildConfig(configUrl: string) {
  const outbound = parseVpnConfig(configUrl);
  return {
    log: { loglevel: "warning" },
    inbounds: [
      {
        listen: "127.0.0.1",
        port: PROXY_PORT,
        protocol: "http",
        settings: {},
      },
    ],
    outbounds: [outbound, { protocol: "freedom", tag: "direct" }],
  };
}

interface ProxyState {
  process: ChildProcess | null;
  status: "stopped" | "starting" | "running" | "error";
  lastError: string | null;
}

const globalKey = "__tirdadXrayState";
function getState(): ProxyState {
  const g = globalThis as unknown as Record<string, ProxyState>;
  if (!g[globalKey]) {
    g[globalKey] = { process: null, status: "stopped", lastError: null };
  }
  return g[globalKey];
}

export function getProxyStatus() {
  const state = getState();
  return { status: state.status, lastError: state.lastError };
}

export function stopProxy() {
  const state = getState();
  state.process?.kill();
  state.process = null;
  state.status = "stopped";
}

// Called on server start (if a VPN config is already saved) and again
// whenever the admin saves/removes one from /admin/settings. Never throws
// — failures are recorded on the module state and surfaced via
// getProxyStatus() instead, so a bad config can't take down the app.
export async function startOrRestartProxy(configUrl: string) {
  const state = getState();
  state.status = "starting";
  state.lastError = null;

  try {
    await ensureBinary();
    const config = buildConfig(configUrl);
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));

    state.process?.kill();
    const child = spawn(BINARY_PATH, ["run", "-c", CONFIG_PATH], { stdio: ["ignore", "pipe", "pipe"] });
    child.stdout?.on("data", (chunk) => console.log(`[xray] ${chunk.toString().trim()}`));
    child.stderr?.on("data", (chunk) => console.error(`[xray] ${chunk.toString().trim()}`));
    child.on("exit", (code) => {
      const s = getState();
      if (s.process === child) {
        s.status = "error";
        s.lastError = `پروسه xray با کد ${code} متوقف شد`;
      }
    });

    state.process = child;
    state.status = "running";
  } catch (err) {
    state.status = "error";
    state.lastError =
      err instanceof VpnConfigParseError || err instanceof Error ? err.message : "خطای ناشناخته در راه‌اندازی پراکسی";
    throw err;
  }
}
