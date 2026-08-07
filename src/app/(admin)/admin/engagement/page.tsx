import { redirect } from "next/navigation";
import { BellRing, MessagesSquare, MousePointerClick, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getAdminLeads, getInstagramConnection } from "@/lib/queries/admin";
import { getMarketingCampaigns, getMarketingContacts } from "@/lib/queries/marketing";
import { leadStageLabel } from "@/lib/status-labels";
import { NewLeadForm } from "@/components/admin/new-lead-form";
import { LeadCard } from "@/components/admin/lead-card";
import { InstagramConnectionCard } from "@/components/admin/instagram-connection-card";
import { InboxPanel } from "@/components/admin/inbox-panel";
import { MarketingPanel } from "@/components/admin/marketing-panel";
import { MarketingCampaignHistory } from "@/components/admin/marketing-campaign-history";

const STAGE_ORDER = ["NEW", "CONTACTED", "OFFERED", "CONVERTED", "LOST"] as const;

export default async function AdminEngagementPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [leads, connection, inboxMessages, contacts, campaigns, webAppInstalls] = await Promise.all([
    getAdminLeads(),
    getInstagramConnection(),
    prisma.inboxMessage.findMany({
      where: { provider: { in: ["TELEGRAM", "BALE", "INSTAGRAM"] } },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    getMarketingContacts(),
    getMarketingCampaigns(),
    prisma.pushSubscription.count(),
  ]);

  const totalLeads = leads.length;
  const converted = leads.filter((lead) => lead.stage === "CONVERTED").length;
  const instagramReachable = contacts.filter((c) => c.segments.includes("INSTAGRAM_DM_ONLY")).length;
  const whatsappReachable = contacts.length;
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clickCount, 0);
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);

  return (
    <div>
      <PageHeader title="ارتباط با مخاطب" description="لیدهای اینستاگرام، صندوق پیام یکپارچه و کمپین‌های مارکتینگ" />

      <AdminTabs
        tabs={[
          {
            key: "crm",
            label: "CRM اینستاگرام",
            content: (
              <>
                <InstagramConnectionCard
                  connectedAt={connection?.connectedAt ?? null}
                  businessAccountId={connection?.businessAccountId ?? null}
                  lastSyncAt={connection?.lastSyncAt ?? null}
                  lastSyncError={connection?.lastSyncError ?? null}
                />

                <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>
                    مجموع لیدها: <strong className="text-foreground">{totalLeads}</strong>
                  </span>
                  <span>
                    نرخ تبدیل:{" "}
                    <strong className="text-foreground">
                      {totalLeads === 0 ? 0 : Math.round((converted / totalLeads) * 100)}٪
                    </strong>
                  </span>
                </div>

                <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
                  {STAGE_ORDER.map((stage) => {
                    const stageLeads = leads.filter((lead) => lead.stage === stage);
                    return (
                      <div key={stage} className="w-64 shrink-0 rounded-xl border border-border bg-card">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                          <span className="text-sm font-semibold">{leadStageLabel[stage]}</span>
                          <Badge variant="outline">{stageLeads.length}</Badge>
                        </div>
                        <div className="space-y-3 p-3">
                          {stageLeads.length === 0 && (
                            <p className="py-6 text-center text-xs text-muted-foreground">لیدی وجود ندارد</p>
                          )}
                          {stageLeads.map((lead) => (
                            <LeadCard key={lead.id} lead={lead} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <NewLeadForm />
              </>
            ),
          },
          {
            key: "inbox",
            label: "صندوق پیام",
            content: (
              <InboxPanel
                messages={inboxMessages.filter(
                  (m): m is typeof m & { provider: "TELEGRAM" | "BALE" | "INSTAGRAM" } =>
                    m.provider === "TELEGRAM" || m.provider === "BALE" || m.provider === "INSTAGRAM",
                )}
              />
            ),
          },
          {
            key: "marketing",
            label: "مارکتینگ",
            content: (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="نصب وب‌اپ (Push)"
                    value={webAppInstalls.toLocaleString("fa-IR")}
                    icon={Smartphone}
                  />
                  <StatCard
                    label="مخاطبان قابل دسترسی در اینستاگرام"
                    value={instagramReachable.toLocaleString("fa-IR")}
                    icon={MessagesSquare}
                  />
                  <StatCard label="کل پیام‌های ارسالی" value={totalSent.toLocaleString("fa-IR")} icon={BellRing} />
                  <StatCard
                    label="کل کلیک‌های کمپین‌ها"
                    value={totalClicks.toLocaleString("fa-IR")}
                    icon={MousePointerClick}
                  />
                </div>

                <MarketingPanel contacts={contacts} />
                <MarketingCampaignHistory campaigns={campaigns} whatsappReachable={whatsappReachable} />
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
