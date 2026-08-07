// Instagram DM via the Meta Graph API (Instagram Messaging). Like the
// existing CRM sync in src/app/api/admin/instagram/sync/route.ts, a
// working call also requires a Meta app with instagram_manage_messages
// approved and a long-lived page-scoped token — this repo can't provision
// that, only call the API once it's set up.

const GRAPH_BASE = "https://graph.facebook.com/v21.0";

export class InstagramApiError extends Error {}

interface GraphErrorBody {
  error?: { message: string };
}

async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${GRAPH_BASE}/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new InstagramApiError("اتصال به Graph API برقرار نشد");
  }
  const body = (await res.json().catch(() => null)) as (T & GraphErrorBody) | null;
  if (!res.ok || body?.error) {
    throw new InstagramApiError(body?.error?.message ?? `Graph API خطای ${res.status} برگرداند`);
  }
  return body as T;
}

export interface Conversation {
  id: string;
  participants?: { data?: { id: string; username?: string }[] };
}

export function fetchConversations(businessAccountId: string, accessToken: string) {
  return graphGet<{ data?: Conversation[] }>(`${businessAccountId}/conversations`, {
    platform: "instagram",
    fields: "participants",
    access_token: accessToken,
  }).then((r) => r.data ?? []);
}

export interface GraphMessage {
  id: string;
  from?: { id: string; username?: string };
  message?: string;
  created_time?: string;
}

export function fetchConversationMessages(conversationId: string, accessToken: string) {
  return graphGet<{ messages?: { data?: GraphMessage[] } }>(conversationId, {
    fields: "messages.limit(20){id,from,message,created_time}",
    access_token: accessToken,
  }).then((r) => r.messages?.data ?? []);
}

export async function sendInstagramMessage(
  businessAccountId: string,
  accessToken: string,
  recipientId: string,
  text: string,
) {
  const url = new URL(`${GRAPH_BASE}/${businessAccountId}/messages`);
  url.searchParams.set("access_token", accessToken);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: { id: recipientId }, message: { text } }),
    });
  } catch {
    throw new InstagramApiError("اتصال به Graph API برقرار نشد");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.error) {
    throw new InstagramApiError(body?.error?.message ?? `Graph API خطای ${res.status} برگرداند`);
  }
  return body;
}
