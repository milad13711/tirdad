import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { limoGetCurrentCredit, LimoSmsError } from "@/lib/sms/limosms-client";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const settings = await prisma.smsSettings.findUnique({ where: { id: 1 } });
  if (!settings?.enabled || !settings.apiKey) {
    return NextResponse.json({ error: "پنل پیامکی متصل نیست" }, { status: 400 });
  }

  try {
    const credit = await limoGetCurrentCredit(settings.apiKey);
    return NextResponse.json({ ok: true, credit: credit.result });
  } catch (err) {
    const message = err instanceof LimoSmsError ? err.message : "دریافت موجودی ناموفق بود";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
