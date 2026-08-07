import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { limoSendSms, LimoSmsError } from "@/lib/sms/limosms-client";

const bodySchema = z.object({
  mobile: z.string().trim().min(8).max(20),
  message: z.string().trim().min(1).max(500),
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

  const settings = await prisma.smsSettings.findUnique({ where: { id: 1 } });
  if (!settings?.enabled || !settings.apiKey || !settings.senderNumber) {
    return NextResponse.json({ error: "پنل پیامکی متصل نیست" }, { status: 400 });
  }

  try {
    const result = await limoSendSms(settings.apiKey, {
      senderNumber: settings.senderNumber,
      message: parsed.data.message,
      mobileNumbers: [parsed.data.mobile],
    });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const message = err instanceof LimoSmsError ? err.message : "ارسال پیامک ناموفق بود";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
