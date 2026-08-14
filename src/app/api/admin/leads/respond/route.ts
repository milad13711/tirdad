import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { limoSendSms, LimoSmsError } from "@/lib/sms/limosms-client";

const bodySchema = z.object({
  id: z.string().min(1),
  message: z.string().trim().min(1).max(600),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
  }
  const { id, message } = parsed.data;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return NextResponse.json({ error: "درخواست پیدا نشد" }, { status: 404 });
  }
  if (!lead.phone) {
    return NextResponse.json({ error: "این درخواست شماره موبایل ندارد" }, { status: 400 });
  }

  const settings = await prisma.smsSettings.findUnique({ where: { id: 1 } });
  if (!settings?.enabled || !settings.apiKey || !settings.senderNumber) {
    return NextResponse.json(
      { error: "پیامک تنظیم نشده — ابتدا از تنظیمات سایت > پیامک وصل کن" },
      { status: 400 },
    );
  }

  try {
    await limoSendSms(settings.apiKey, {
      senderNumber: settings.senderNumber,
      message,
      mobileNumbers: [lead.phone],
    });
  } catch (err) {
    const errMessage = err instanceof LimoSmsError ? err.message : "ارسال پیامک ناموفق بود";
    return NextResponse.json({ error: errMessage }, { status: 502 });
  }

  const updated = await prisma.lead.update({
    where: { id },
    data: { analysisNote: message, respondedAt: new Date(), stage: lead.stage === "NEW" ? "CONTACTED" : lead.stage },
  });

  return NextResponse.json({ ok: true, lead: updated });
}
