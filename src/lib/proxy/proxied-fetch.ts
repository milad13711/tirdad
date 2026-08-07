import "server-only";
import { fetch as undiciFetch, ProxyAgent } from "undici";
import { getProxyStatus, PROXY_URL } from "./xray-manager";

let agent: ProxyAgent | null = null;
function getAgent() {
  if (!agent) agent = new ProxyAgent(PROXY_URL);
  return agent;
}

// Used only by the Telegram/Bale and Instagram API clients — everything
// else in the app (LimoSMS, Zarinpal, uploads, ...) keeps using the plain
// global fetch untouched. Falls back to a direct connection whenever the
// proxy isn't configured/running, so these clients behave exactly as
// before until an admin actually saves a working VPN config.
export async function proxiedFetch(url: string | URL, init?: RequestInit): Promise<Response> {
  const { status } = getProxyStatus();
  if (status !== "running") {
    return fetch(url, init);
  }
  // undici's Response is structurally compatible with the subset of the
  // global Response API these clients use (.ok, .status, .json()); cast
  // rather than duplicate every call site's typing.
  return undiciFetch(url as string, { ...(init as Record<string, unknown>), dispatcher: getAgent() }) as unknown as Response;
}
