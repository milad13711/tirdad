// WhatsApp Cloud API (Meta Graph API). Unlike Telegram/Bale/Instagram this
// provider has no polling option — Meta only pushes messages via webhook,
// received at src/app/api/webhooks/whatsapp/route.ts. This module only
// covers the outbound side (sending replies) and the connect-time identity
// check.
//
// Filtered in Iran like Instagram/Telegram/Bale, so requests go through
// proxiedFetch (see src/lib/proxy/proxied-fetch.ts).
import { proxiedFetch } from "@/lib/proxy/proxied-fetch";

const GRAPH_BASE = "https://graph.facebook.com/v21.0";

export class WhatsAppApiError extends Error {}

interface GraphErrorBody {
  error?: { message: string };
}

async function graphCall<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await proxiedFetch(`${GRAPH_BASE}/${path}`, {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new WhatsAppApiError("اتصال به Graph API برقرار نشد");
  }
  const body = (await res.json().catch(() => null)) as (T & GraphErrorBody) | null;
  if (!res.ok || body?.error) {
    throw new WhatsAppApiError(body?.error?.message ?? `Graph API خطای ${res.status} برگرداند`);
  }
  return body as T;
}

// Used on connect to verify the access token actually has access to the
// given Phone Number ID before saving the connection.
export function getPhoneNumberInfo(phoneNumberId: string, token: string) {
  return graphCall<{ display_phone_number?: string; verified_name?: string }>(
    `${phoneNumberId}?fields=display_phone_number,verified_name`,
    token,
  );
}

export function sendWhatsAppMessage(phoneNumberId: string, token: string, to: string, text: string) {
  return graphCall(`${phoneNumberId}/messages`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}
