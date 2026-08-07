import "server-only";
import { prisma } from "@/lib/db";
import type { MessengerProvider } from "@/generated/prisma/client";

export async function getMessengerConnections() {
  return prisma.messengerConnection.findMany();
}

export interface InboxThread {
  provider: MessengerProvider;
  externalId: string;
  senderName: string | null;
  senderHandle: string | null;
  lastMessage: string;
  lastAt: Date;
}

// Threads aren't a separate table — they're derived from the most recent
// message per (provider, externalId) pair, which is all the inbox list
// view needs. Fine at this message volume; revisit with a dedicated
// thread table if it ever needs to scale past a few thousand messages.
export async function getInboxThreads(): Promise<InboxThread[]> {
  const messages = await prisma.inboxMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const byThread = new Map<string, InboxThread>();
  for (const message of messages) {
    const key = `${message.provider}:${message.externalId}`;
    if (!byThread.has(key)) {
      byThread.set(key, {
        provider: message.provider,
        externalId: message.externalId,
        senderName: message.senderName,
        senderHandle: message.senderHandle,
        lastMessage: message.text,
        lastAt: message.createdAt,
      });
    }
  }
  return [...byThread.values()];
}

export async function getThreadMessages(provider: MessengerProvider, externalId: string) {
  return prisma.inboxMessage.findMany({
    where: { provider, externalId },
    orderBy: { createdAt: "asc" },
  });
}
