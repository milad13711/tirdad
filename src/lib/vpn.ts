// Storage-only for now — see the VpnConfig model comment in schema.prisma.
// Detects VLESS vs VMess from the URI scheme and does a light sanity
// check on each format so obviously-malformed pastes are rejected before
// they're saved.

export type VpnProtocol = "VLESS" | "VMESS";

export function detectVpnProtocol(configUrl: string): VpnProtocol | null {
  if (configUrl.startsWith("vless://")) return "VLESS";
  if (configUrl.startsWith("vmess://")) return "VMESS";
  return null;
}

export function validateVpnConfig(configUrl: string): { valid: true; protocol: VpnProtocol } | { valid: false; error: string } {
  const trimmed = configUrl.trim();
  const protocol = detectVpnProtocol(trimmed);
  if (!protocol) {
    return { valid: false, error: "کانفیگ باید با vless:// یا vmess:// شروع بشه" };
  }

  if (protocol === "VLESS") {
    try {
      new URL(trimmed);
    } catch {
      return { valid: false, error: "فرمت لینک VLESS نامعتبر است" };
    }
    return { valid: true, protocol };
  }

  // vmess://<base64 JSON>
  const payload = trimmed.slice("vmess://".length).split("#")[0];
  try {
    const decoded = Buffer.from(payload, "base64").toString("utf8");
    JSON.parse(decoded);
  } catch {
    return { valid: false, error: "فرمت کانفیگ VMess نامعتبر است (base64/JSON نامعتبر)" };
  }
  return { valid: true, protocol };
}

export function maskVpnConfig(configUrl: string) {
  if (configUrl.length <= 24) return "••••••••";
  return `${configUrl.slice(0, 12)}••••••••${configUrl.slice(-8)}`;
}
