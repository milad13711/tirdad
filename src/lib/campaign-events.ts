import "server-only";
import { prisma } from "@/lib/db";

export type CampaignEventType = "page_view" | "dwell_10s" | "section_focus" | "pay_click" | "pay_success";

// Best-effort, same reasoning as logEvent — a tracking failure must never
// break the actual page/purchase flow it's attached to.
export async function recordCampaignEvent(params: {
  productKey: string;
  campaignLinkId?: string | null;
  sessionId: string;
  type: CampaignEventType;
  section?: string;
}): Promise<void> {
  try {
    await prisma.campaignEvent.create({
      data: {
        productKey: params.productKey,
        campaignLinkId: params.campaignLinkId ?? undefined,
        sessionId: params.sessionId,
        type: params.type,
        section: params.section,
      },
    });
  } catch (err) {
    console.error("[campaign-events] failed to record event:", err);
  }
}

export async function resolveCampaignLinkId(slug: string | null | undefined): Promise<string | null> {
  if (!slug) return null;
  const link = await prisma.campaignLink.findUnique({ where: { slug }, select: { id: true } });
  return link?.id ?? null;
}
