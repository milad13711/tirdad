import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { sendMessage, BotApiError, type PolledProvider } from "@/lib/messengers/bot-client";

const bodySchema = z.object({
  provider: z.enum(["TELEGRAM", "BALE"]),
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

  const connection = await prisma.messengerConnection.findUnique({ where: { provider } });
  if (!connection?.token || !connection.connectedAt) {
    return NextResponse.json({ error: "این پیام‌رسان متصل نیست" }, { status: 400 });
  }

  try {
    await sendMessage(provider as PolledProvider, connection.token, externalId, text);
    const message = await prisma.inboxMessage.create({
      data: { provider, externalId, direction: "OUT", text },
    });
    return NextResponse.json({ ok: true, message });
  } catch (err) {
    const errMessage = err instanceof BotApiError ? err.message : "ارسال پاسخ ناموفق بود";
    return NextResponse.json({ error: errMessage }, { status: 502 });
  }
}
