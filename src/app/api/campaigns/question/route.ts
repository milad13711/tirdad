import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/auth/otp";
import { resolveCampaignLinkId } from "@/lib/campaign-events";
import { parseProductKey } from "@/lib/product-key";
import { notifyAdmins } from "@/lib/telegram";

const bodySchema = z.object({
  productKey: z.string().min(1),
  campaignSlug: z.string().optional(),
  phone: z.string().min(1),
  message: z.string().trim().min(2).max(1000),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !parseProductKey(parsed.data.productKey)) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "شماره موبایل نامعتبر است" }, { status: 400 });
  }

  const campaignLinkId = await resolveCampaignLinkId(parsed.data.campaignSlug);
  await prisma.campaignQuestion.create({
    data: {
      productKey: parsed.data.productKey,
      campaignLinkId,
      phone,
      message: parsed.data.message,
    },
  });

  void notifyAdmins(`❓ سوال جدید از صفحه محصول\nشماره: ${phone}\nپیام: ${parsed.data.message}`);

  return NextResponse.json({ ok: true });
}
