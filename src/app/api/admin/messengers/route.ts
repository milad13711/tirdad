import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getMe, BotApiError } from "@/lib/messengers/bot-client";

const connectSchema = z.object({
  provider: z.enum(["TELEGRAM", "BALE"]),
  token: z.string().trim().min(10, "توکن نامعتبر است"),
});

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = connectSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const { provider, token } = parsed.data;

  try {
    const bot = await getMe(provider, token);
    const connection = await prisma.messengerConnection.upsert({
      where: { provider },
      update: { token, botUsername: bot.username ?? bot.first_name, connectedAt: new Date(), pollOffset: 0, lastPollError: null },
      create: { provider, token, botUsername: bot.username ?? bot.first_name, connectedAt: new Date() },
    });
    return NextResponse.json({ ok: true, connection: { ...connection, token: undefined } });
  } catch (err) {
    const message = err instanceof BotApiError ? err.message : "اتصال ناموفق بود";
    return NextResponse.json({ error: `توکن تایید نشد: ${message}` }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const provider = new URL(request.url).searchParams.get("provider");
  if (provider !== "TELEGRAM" && provider !== "BALE") {
    return NextResponse.json({ error: "پیام‌رسان نامعتبر است" }, { status: 400 });
  }

  await prisma.messengerConnection.updateMany({
    where: { provider },
    data: { token: null, botUsername: null, connectedAt: null },
  });

  return NextResponse.json({ ok: true });
}
