import { NextResponse } from "next/server";
import { z } from "zod";
import { recordCampaignEvent, resolveCampaignLinkId, type CampaignEventType } from "@/lib/campaign-events";
import { parseProductKey } from "@/lib/product-key";

const bodySchema = z.object({
  productKey: z.string().min(1),
  campaignSlug: z.string().optional(),
  sessionId: z.string().min(1),
  type: z.enum(["page_view", "dwell_10s", "section_focus", "pay_click"]),
  section: z.string().optional(),
});

// Public, unauthenticated — fired from the product landing page's client
// tracker (see src/components/site/campaign-tracker.tsx) and from
// BuyButton before redirecting to the payment gateway. pay_success is
// recorded server-side from the payment callback instead, not via this
// route, since it must be trustworthy (not something a visitor's browser
// could fake by just POSTing here).
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !parseProductKey(parsed.data.productKey)) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const campaignLinkId = await resolveCampaignLinkId(parsed.data.campaignSlug);
  await recordCampaignEvent({
    productKey: parsed.data.productKey,
    campaignLinkId,
    sessionId: parsed.data.sessionId,
    type: parsed.data.type as CampaignEventType,
    section: parsed.data.section,
  });

  return NextResponse.json({ ok: true });
}
