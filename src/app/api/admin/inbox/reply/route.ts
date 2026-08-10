import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { sendMessage, BotApiError, type PolledProvider } from "@/lib/messengers/bot-client";
import { sendInstagramMessage, InstagramApiError } from "@/lib/messengers/instagram-client";
import { sendWhatsAppMessage, WhatsAppApiError } from "@/lib/messengers/whatsapp-client";

const bodySchema = z.object({
  provider: z.enum(["TELEGRAM", "BALE", "INSTAGRAM", "WHATSAPP"]),
  externalId: z.string().min(1),
  text: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const { provider, externalId, text } = parsed.data;

  try {
    if (provider === "INSTAGRAM") {
      const connection = await prisma.instagramConnection.findUnique({ where: { id: 1 } });
      if (!connection?.accessToken || !connection.businessAccountId || !connection.connectedAt) {
        return NextResponse.json({ error: "اکانت اینستاگرام متصل نیست" }, { status: 400 });
      }
      await sendInstagramMessage(connection.businessAccountId, connection.accessToken, externalId, text);
    } else if (provider === "WHATSAPP") {
      const connection = await prisma.messengerConnection.findUnique({ where: { provider: "WHATSAPP" } });
      if (!connection?.token || !connection.phoneNumberId || !connection.connectedAt) {
        return NextResponse.json({ error: "واتساپ متصل نیست" }, { status: 400 });
      }
      await sendWhatsAppMessage(connection.phoneNumberId, connection.token, externalId, text);
    } else {
      const connection = await prisma.messengerConnection.findUnique({ where: { provider } });
      if (!connection?.token || !connection.connectedAt) {
        return NextResponse.json({ error: "این پیام‌رسان متصل نیست" }, { status: 400 });
      }
      await sendMessage(provider as PolledProvider, connection.token, externalId, text);
    }

    const message = await prisma.inboxMessage.create({
      data: { provider, externalId, direction: "OUT", text },
    });
    return NextResponse.json({ ok: true, message });
  } catch (err) {
    const errMessage =
      err instanceof BotApiError || err instanceof InstagramApiError || err instanceof WhatsAppApiError
        ? err.message
        : "ارسال پاسخ ناموفق بود";
    return NextResponse.json({ error: errMessage }, { status: 502 });
  }
}
