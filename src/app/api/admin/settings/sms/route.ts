import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { limoGetCurrentCredit, LimoSmsError } from "@/lib/sms/limosms-client";

const saveSchema = z.object({
  apiKey: z.string().trim().min(10, "توکن پنل پیامکی نامعتبر است"),
  senderNumber: z.string().trim().min(3, "شماره ارسال‌کننده نامعتبر است"),
});

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

// Saves the token + sender number, then immediately verifies them against
// LimoSMS's getcurrentcredit endpoint — `enabled` only flips to true once
// that check succeeds, so dispatchSmsTrigger() can trust the flag blindly.
export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const { apiKey, senderNumber } = parsed.data;

  try {
    const credit = await limoGetCurrentCredit(apiKey);
    const settings = await prisma.smsSettings.upsert({
      where: { id: 1 },
      update: { apiKey, senderNumber, enabled: true },
      create: { id: 1, apiKey, senderNumber, enabled: true },
    });
    return NextResponse.json({ ok: true, settings, credit: credit.Result });
  } catch (err) {
    await prisma.smsSettings.upsert({
      where: { id: 1 },
      update: { apiKey, senderNumber, enabled: false },
      create: { id: 1, apiKey, senderNumber, enabled: false },
    });
    const message = err instanceof LimoSmsError ? err.message : "اتصال به لیمو اس‌ام‌اس ناموفق بود";
    return NextResponse.json({ error: `توکن ذخیره شد ولی اتصال تایید نشد: ${message}` }, { status: 400 });
  }
}

export async function DELETE() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  await prisma.smsSettings.upsert({
    where: { id: 1 },
    update: { apiKey: null, senderNumber: null, enabled: false },
    create: { id: 1, enabled: false },
  });

  return NextResponse.json({ ok: true });
}
