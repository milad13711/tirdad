// Telegram and Bale both expose a Telegram-compatible Bot API (Bale is a
// fork), differing only in base URL. Shared client covers getMe (used to
// verify a token on connect), getUpdates (long-poll for new messages),
// and sendMessage (admin replies from the inbox).
//
// Both are filtered in Iran, so requests go through proxiedFetch — routed
// via the admin's VPN config when one is connected and running, otherwise
// a plain direct connection (unchanged from before the VPN feature).
import { proxiedFetch } from "@/lib/proxy/proxied-fetch";

export type PolledProvider = "TELEGRAM" | "BALE";

export class BotApiError extends Error {}

function apiBase(provider: PolledProvider, token: string) {
  const host = provider === "TELEGRAM" ? "api.telegram.org" : "tapi.bale.ai";
  return `https://${host}/bot${token}`;
}

async function call<T>(provider: PolledProvider, token: string, method: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await proxiedFetch(`${apiBase(provider, token)}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new BotApiError("اتصال به سرور پیام‌رسان برقرار نشد");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    throw new BotApiError((data && data.description) || `درخواست ناموفق بود (${response.status})`);
  }
  return data.result as T;
}

export interface BotIdentity {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

export function getMe(provider: PolledProvider, token: string) {
  return call<BotIdentity>(provider, token, "getMe");
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    chat: { id: number };
    from?: { first_name?: string; last_name?: string; username?: string };
    text?: string;
  };
}

export function getUpdates(provider: PolledProvider, token: string, offset: number) {
  return call<TelegramUpdate[]>(provider, token, "getUpdates", { offset, timeout: 0, limit: 50 });
}

export function sendMessage(provider: PolledProvider, token: string, chatId: string, text: string) {
  return call<unknown>(provider, token, "sendMessage", { chat_id: chatId, text });
}
