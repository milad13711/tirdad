import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { notifyAdmins } from "@/lib/telegram";
import { dispatchSmsTrigger } from "@/lib/sms/dispatch";
import { isRateLimited } from "@/lib/auth/rate-limit";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(20),
  message: z.string().trim().max(1000).optional(),
  pageUrl: z.string().trim().max(200).optional(),
  attachmentUrl: z.string().trim().max(500).optional(),
});

// Public, unauthenticated endpoint: the landing page's "leave your contact
// info instead of DMing us" form under the Instagram CRM section. Anyone
// with the URL can POST here, so keep it tightly rate-limited by IP.
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`leads:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "درخواست‌های زیاد، کمی صبر کنید" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      message: parsed.data.message,
      topic: parsed.data.message,
      pageUrl: parsed.data.pageUrl,
      attachmentUrl: parsed.data.attachmentUrl,
      source: "WEBSITE",
    },
  });

  void notifyAdmins(
    `📩 لید جدید از فرم سایت\nنام: ${lead.name}\nموبایل: ${lead.phone}` +
      (lead.pageUrl ? `\nپیج: ${lead.pageUrl}` : ""),
  );

  if (lead.phone) {
    void dispatchSmsTrigger("LEAD_CREATED", lead.phone, { name: lead.name });
  }

  return NextResponse.json({ ok: true });
}
