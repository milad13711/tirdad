import "server-only";
import { prisma } from "@/lib/db";
import type { SegmentKey } from "@/lib/marketing-segments";

export type { SegmentKey } from "@/lib/marketing-segments";
export { SEGMENTS, SEGMENT_KEYS } from "@/lib/marketing-segments";

// A "segment" is a behavioral bucket contacts are matched into. Contacts
// are deduplicated by phone number and can carry multiple segments (e.g.
// bought a course AND requested a page analysis) — INSTAGRAM_DM_ONLY is
// the exception: it only applies when Instagram DM is literally the only
// interaction we have on record for that phone number.
//
// CRM is approximated as "has ever had a Subscription" — the Instagram
// CRM dashboard feature is gated behind a paid plan, and there's no
// separate purchase record for it specifically.

export interface MarketingContact {
  phone: string;
  name: string | null;
  userId: string | null;
  segments: SegmentKey[];
  hasWebPush: boolean;
}

export async function getMarketingContacts(): Promise<MarketingContact[]> {
  const [users, leads] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        name: true,
        _count: {
          select: {
            generations: true,
            promptPurchases: true,
            enrollments: true,
            subscriptions: true,
            pushSubscriptions: true,
          },
        },
      },
    }),
    prisma.lead.findMany({
      select: { phone: true, name: true, source: true, pageUrl: true },
    }),
  ]);

  const byPhone = new Map<string, MarketingContact & { hasDmLead: boolean }>();

  for (const user of users) {
    const segments: SegmentKey[] = [];
    if (user._count.generations > 0 || user._count.promptPurchases > 0) segments.push("PROMPT");
    if (user._count.enrollments > 0) segments.push("COURSE");
    if (user._count.subscriptions > 0) segments.push("CRM");
    byPhone.set(user.phone, {
      phone: user.phone,
      name: user.name,
      userId: user.id,
      segments,
      hasWebPush: user._count.pushSubscriptions > 0,
      hasDmLead: false,
    });
  }

  for (const lead of leads) {
    if (!lead.phone) continue;
    const isPageAnalysis = Boolean(lead.pageUrl);
    const isDmSource = lead.source !== "WEBSITE";
    const existing = byPhone.get(lead.phone);
    if (existing) {
      if (isPageAnalysis && !existing.segments.includes("PAGE_ANALYSIS")) {
        existing.segments.push("PAGE_ANALYSIS");
      }
      if (isDmSource) existing.hasDmLead = true;
      if (!existing.name && lead.name) existing.name = lead.name;
    } else {
      byPhone.set(lead.phone, {
        phone: lead.phone,
        name: lead.name,
        userId: null,
        segments: isPageAnalysis ? ["PAGE_ANALYSIS"] : [],
        hasWebPush: false,
        hasDmLead: isDmSource,
      });
    }
  }

  return [...byPhone.values()].map(({ hasDmLead, ...contact }) => ({
    ...contact,
    segments:
      contact.segments.length === 0 && hasDmLead ? (["INSTAGRAM_DM_ONLY"] as SegmentKey[]) : contact.segments,
  }));
}

export async function getMarketingCampaigns() {
  return prisma.marketingCampaign.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
}
