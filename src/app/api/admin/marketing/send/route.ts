import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getMarketingContacts } from "@/lib/queries/marketing";
import { SEGMENT_KEYS } from "@/lib/marketing-segments";
import { sendPushToUsers } from "@/lib/push";
import { limoSendSms, LimoSmsError } from "@/lib/sms/limosms-client";

const bodySchema = z.object({
  segments: z.array(z.enum(SEGMENT_KEYS as [string, ...string[]])).min(1),
  channel: z.enum(["PUSH", "SMS", "WHATSAPP"]),
  message: z.string().trim().min(1).max(500),
  title: z.string().trim().max(80).optional(),
  linkPath: z.string().trim().max(200).optional(),
});

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

// Iranian mobile numbers are stored as 09xxxxxxxxx; wa.me needs the
// international form without the leading zero.
function toWhatsAppNumber(phone: string) {
  return `98${phone.replace(/^0/, "")}`;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات ارسال نامعتبر است" }, { status: 400 });
  }

  const { segments, channel, message, title, linkPath } = parsed.data;

  const allContacts = await getMarketingContacts();
  const matched = allContacts.filter((c) => c.segments.some((s) => segments.includes(s)));

  if (matched.length === 0) {
    return NextResponse.json({ error: "با این فیلترها مخاطبی پیدا نشد" }, { status: 400 });
  }

  const campaign = await prisma.marketingCampaign.create({
    data: {
      channel,
      message,
      segments,
      recipientCount: matched.length,
    },
  });

  const trackedUrl = linkPath
    ? `${appUrl()}/api/marketing/click/${campaign.id}?to=${encodeURIComponent(linkPath)}`
    : undefined;

  if (channel === "PUSH") {
    const userIds = matched.filter((c) => c.userId && c.hasWebPush).map((c) => c.userId as string);
    if (userIds.length === 0) {
      return NextResponse.json({ error: "هیچ‌کدام از مخاطبان انتخابی وب‌اپ نصب ندارند" }, { status: 400 });
    }
    const result = await sendPushToUsers(userIds, {
      title: title || "تیرداد",
      body: message,
      url: trackedUrl,
    });
    await prisma.marketingCampaign.update({ where: { id: campaign.id }, data: { sentCount: result.sent } });
    return NextResponse.json({ ok: true, campaign: campaign.id, ...result });
  }

  if (channel === "SMS") {
    const settings = await prisma.smsSettings.findUnique({ where: { id: 1 } });
    if (!settings?.enabled || !settings.apiKey || !settings.senderNumber) {
      return NextResponse.json({ error: "پنل پیامکی متصل نیست" }, { status: 400 });
    }
    const phones = matched.map((c) => c.phone);
    const fullMessage = trackedUrl ? `${message}\n${trackedUrl}` : message;
    try {
      await limoSendSms(settings.apiKey, {
        senderNumber: settings.senderNumber,
        message: fullMessage,
        mobileNumbers: phones,
      });
      await prisma.marketingCampaign.update({ where: { id: campaign.id }, data: { sentCount: phones.length } });
      return NextResponse.json({ ok: true, campaign: campaign.id, sent: phones.length });
    } catch (err) {
      const errMessage = err instanceof LimoSmsError ? err.message : "ارسال پیامک ناموفق بود";
      return NextResponse.json({ error: errMessage }, { status: 502 });
    }
  }

  // WHATSAPP: no bot/API connection yet (planned for the messenger-integration
  // phase) — return per-contact wa.me deep links pre-filled with the message
  // for the admin to open and send manually.
  const links = matched.map((c) => ({
    phone: c.phone,
    name: c.name,
    url: `https://wa.me/${toWhatsAppNumber(c.phone)}?text=${encodeURIComponent(message)}`,
  }));
  return NextResponse.json({ ok: true, campaign: campaign.id, manual: true, links });
}
