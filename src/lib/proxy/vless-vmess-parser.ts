// Parses a VLESS/VMess share URI into an Xray-core outbound object.
// Only the two most common transport/security combos are supported —
// tcp/ws transport with none/tls security. Anything else (grpc, quic, h2,
// REALITY) is rejected with a clear error rather than silently emitting a
// config that won't actually connect.

export class VpnConfigParseError extends Error {}

interface XrayOutbound {
  protocol: "vless" | "vmess";
  tag: string;
  settings: unknown;
  streamSettings?: unknown;
}

const SUPPORTED_NETWORKS = new Set(["tcp", "ws"]);
const SUPPORTED_SECURITY = new Set(["none", "tls", ""]);

function buildStreamSettings(params: URLSearchParams, fallbackHost: string) {
  const network = params.get("type") || "tcp";
  const security = params.get("security") || "none";

  if (!SUPPORTED_NETWORKS.has(network)) {
    throw new VpnConfigParseError(`نوع انتقال «${network}» پشتیبانی نمی‌شود (فقط tcp و ws)`);
  }
  if (!SUPPORTED_SECURITY.has(security)) {
    throw new VpnConfigParseError(`نوع امنیت «${security}» پشتیبانی نمی‌شود (فقط none و tls)`);
  }

  const streamSettings: Record<string, unknown> = { network };

  if (security === "tls") {
    streamSettings.security = "tls";
    streamSettings.tlsSettings = {
      serverName: params.get("sni") || fallbackHost,
      allowInsecure: false,
    };
  }

  if (network === "ws") {
    const host = params.get("host");
    streamSettings.wsSettings = {
      path: params.get("path") || "/",
      headers: host ? { Host: host } : {},
    };
  }

  return streamSettings;
}

function parseVless(uri: string): XrayOutbound {
  const url = new URL(uri);
  const uuid = url.username;
  const host = url.hostname;
  const port = Number(url.port);
  if (!uuid || !host || !port) {
    throw new VpnConfigParseError("لینک VLESS ناقص است (uuid/host/port)");
  }

  return {
    protocol: "vless",
    tag: "vpn-out",
    settings: {
      vnext: [
        {
          address: host,
          port,
          users: [{ id: uuid, encryption: "none", flow: url.searchParams.get("flow") || undefined }],
        },
      ],
    },
    streamSettings: buildStreamSettings(url.searchParams, host),
  };
}

interface VmessPayload {
  add?: string;
  port?: string | number;
  id?: string;
  aid?: string | number;
  scy?: string;
  net?: string;
  host?: string;
  path?: string;
  tls?: string;
  sni?: string;
}

function parseVmess(uri: string): XrayOutbound {
  const payload = uri.slice("vmess://".length).split("#")[0];
  let data: VmessPayload;
  try {
    data = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  } catch {
    throw new VpnConfigParseError("فرمت کانفیگ VMess نامعتبر است");
  }

  const host = data.add;
  const port = Number(data.port);
  if (!host || !data.id || !port) {
    throw new VpnConfigParseError("کانفیگ VMess ناقص است (add/id/port)");
  }

  const params = new URLSearchParams();
  if (data.net) params.set("type", data.net);
  if (data.tls) params.set("security", data.tls === "tls" ? "tls" : "none");
  if (data.sni) params.set("sni", data.sni);
  if (data.path) params.set("path", data.path);
  if (data.host) params.set("host", data.host);

  return {
    protocol: "vmess",
    tag: "vpn-out",
    settings: {
      vnext: [
        {
          address: host,
          port,
          users: [{ id: data.id, alterId: Number(data.aid ?? 0), security: data.scy || "auto" }],
        },
      ],
    },
    streamSettings: buildStreamSettings(params, host),
  };
}

export function parseVpnConfig(configUrl: string): XrayOutbound {
  const trimmed = configUrl.trim();
  if (trimmed.startsWith("vless://")) return parseVless(trimmed);
  if (trimmed.startsWith("vmess://")) return parseVmess(trimmed);
  throw new VpnConfigParseError("کانفیگ باید با vless:// یا vmess:// شروع شود");
}
