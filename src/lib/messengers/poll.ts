import "server-only";
import { prisma } from "@/lib/db";
import { getUpdates, type PolledProvider } from "./bot-client";
import { fetchConversations, fetchConversationMessages } from "./instagram-client";

async function pollConnection(provider: PolledProvider) {
  const conn = await prisma.messengerConnection.findUnique({ where: { provider } });
  if (!conn?.token || !conn.connectedAt) return;

  try {
    const updates = await getUpdates(provider, conn.token, conn.pollOffset);

    for (const update of updates) {
      const message = update.message;
      if (!message?.text) continue;
      const senderName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ");
      await prisma.inboxMessage.create({
        data: {
          provider,
          externalId: String(message.chat.id),
          senderName: senderName || null,
          senderHandle: message.from?.username ? `@${message.from.username}` : null,
          direction: "IN",
          text: message.text,
        },
      });
    }

    const nextOffset =
      updates.length > 0 ? Math.max(...updates.map((u) => u.update_id)) + 1 : conn.pollOffset;

    await prisma.messengerConnection.update({
      where: { provider },
      data: { pollOffset: nextOffset, lastPollAt: new Date(), lastPollError: null },
    });
  } catch (err) {
    await prisma.messengerConnection.update({
      where: { provider },
      data: { lastPollError: err instanceof Error ? err.message : "خطای نامشخص", lastPollAt: new Date() },
    });
  }
}

export async function pollAllMessengers() {
  await Promise.all([pollConnection("TELEGRAM"), pollConnection("BALE")]);
}

// Instagram's Graph API has no Telegram-style update offset, so each pass
// re-fetches every conversation's recent messages and dedupes against
// already-imported ones via InboxMessage.externalMessageId (unique). Kept
// on a slower interval than the bot polling to stay well under Graph
// API's rate limits.
export async function pollInstagram() {
  const connection = await prisma.instagramConnection.findUnique({ where: { id: 1 } });
  if (!connection?.accessToken || !connection.businessAccountId || !connection.connectedAt) return;

  try {
    const conversations = await fetchConversations(connection.businessAccountId, connection.accessToken);

    for (const conversation of conversations) {
      const participant = conversation.participants?.data?.find((p) => p.id !== connection.businessAccountId);
      if (!participant) continue;

      const messages = await fetchConversationMessages(conversation.id, connection.accessToken);
      for (const message of messages) {
        if (!message.message || !message.id) continue;
        if (message.from?.id === connection.businessAccountId) continue; // our own outgoing message

        await prisma.inboxMessage.upsert({
          where: { externalMessageId: message.id },
          update: {},
          create: {
            provider: "INSTAGRAM",
            externalId: participant.id,
            senderName: participant.username ?? null,
            senderHandle: participant.username ? `@${participant.username}` : null,
            direction: "IN",
            text: message.message,
            externalMessageId: message.id,
          },
        });
      }
    }

    await prisma.instagramConnection.update({
      where: { id: 1 },
      data: { lastSyncAt: new Date(), lastSyncError: null },
    });
  } catch (err) {
    await prisma.instagramConnection.update({
      where: { id: 1 },
      data: { lastSyncAt: new Date(), lastSyncError: err instanceof Error ? err.message : "خطای نامشخص" },
    });
  }
}

const BOT_POLL_INTERVAL_MS = 5000;
const INSTAGRAM_POLL_INTERVAL_MS = 30_000;
const globalKey = "__tirdadMessengerPollingStarted";

// Called once from instrumentation.ts when the server process starts.
// Guarded against double-start (Next dev-mode hot reload can re-invoke
// register()) with a flag on globalThis, since module-level state doesn't
// survive HMR the same way.
export function startMessengerPolling() {
  const g = globalThis as unknown as Record<string, boolean>;
  if (g[globalKey]) return;
  g[globalKey] = true;
  console.log("[messengers:poll] started (bots: 5s, instagram: 30s)");

  setInterval(() => {
    pollAllMessengers().catch((err) => console.error("[messengers:poll] unexpected error:", err));
  }, BOT_POLL_INTERVAL_MS);

  setInterval(() => {
    pollInstagram().catch((err) => console.error("[messengers:poll:instagram] unexpected error:", err));
  }, INSTAGRAM_POLL_INTERVAL_MS);
}
