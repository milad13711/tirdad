// Meta calls GET once to verify this webhook URL (hub.challenge handshake),
// then POSTs every inbound WhatsApp message here going forward. No admin
// session on either path — Meta itself is the caller — so GET is guarded
// by the verify token the admin chose in /admin/settings (پیام‌رسان‌ها tab)
// and POST just has to respond fast with 200 regardless of content, per
// Meta's webhook delivery requirements.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const connection = await prisma.messengerConnection.findUnique({ where: { provider: "WHATSAPP" } });
  if (mode === "subscribe" && token && connection?.verifyToken && token === connection.verifyToken) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

interface WhatsAppWebhookBody {
  entry?: {
    changes?: {
      value?: {
        contacts?: { profile?: { name?: string }; wa_id?: string }[];
        messages?: { id: string; from: string; type: string; text?: { body?: string } }[];
      };
    }[];
  }[];
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as WhatsAppWebhookBody | null;

  try {
    for (const entry of body?.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        for (const message of value?.messages ?? []) {
          if (message.type !== "text" || !message.text?.body) continue;
          const contact = value?.contacts?.find((c) => c.wa_id === message.from);
          await prisma.inboxMessage.upsert({
            where: { externalMessageId: message.id },
            update: {},
            create: {
              provider: "WHATSAPP",
              externalId: message.from,
              senderName: contact?.profile?.name ?? null,
              direction: "IN",
              text: message.text.body,
              externalMessageId: message.id,
            },
          });
        }
      }
    }
  } catch (err) {
    // Meta retries on non-2xx, and a malformed/unexpected payload here
    // shouldn't cause retry storms — log and still ack.
    console.error("[webhooks:whatsapp] failed to process payload:", err);
  }

  return NextResponse.json({ ok: true });
}
