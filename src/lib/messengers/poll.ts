import "server-only";
import { prisma } from "@/lib/db";
import { getUpdates, type PolledProvider } from "./bot-client";

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

const POLL_INTERVAL_MS = 5000;
const globalKey = "__tirdadMessengerPollingStarted";

// Called once from instrumentation.ts when the server process starts.
// Guarded against double-start (Next dev-mode hot reload can re-invoke
// register()) with a flag on globalThis, since module-level state doesn't
// survive HMR the same way.
export function startMessengerPolling() {
  const g = globalThis as unknown as Record<string, boolean>;
  if (g[globalKey]) return;
  g[globalKey] = true;
  console.log("[messengers:poll] started (interval: 5s)");

  setInterval(() => {
    pollAllMessengers().catch((err) => console.error("[messengers:poll] unexpected error:", err));
  }, POLL_INTERVAL_MS);
}
