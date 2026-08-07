import { redirect } from "next/navigation";
import { BellRing, MessagesSquare, MousePointerClick, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getMarketingCampaigns, getMarketingContacts } from "@/lib/queries/marketing";
import { MarketingPanel } from "@/components/admin/marketing-panel";
import { MarketingCampaignHistory } from "@/components/admin/marketing-campaign-history";

export default async function AdminMarketingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [contacts, campaigns, webAppInstalls] = await Promise.all([
    getMarketingContacts(),
    getMarketingCampaigns(),
    prisma.pushSubscription.count(),
  ]);

  const instagramReachable = contacts.filter((c) => c.segments.includes("INSTAGRAM_DM_ONLY")).length;
  const whatsappReachable = contacts.length;
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clickCount, 0);
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="مارکتینگ"
        description="فیلتر مخاطبان براساس رفتارشان و ارسال کمپین از کانال‌های مختلف"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="نصب وب‌اپ (Push)" value={webAppInstalls.toLocaleString("fa-IR")} icon={Smartphone} />
        <StatCard
          label="مخاطبان قابل دسترسی در اینستاگرام"
          value={instagramReachable.toLocaleString("fa-IR")}
          icon={MessagesSquare}
        />
        <StatCard label="کل پیام‌های ارسالی" value={totalSent.toLocaleString("fa-IR")} icon={BellRing} />
        <StatCard label="کل کلیک‌های کمپین‌ها" value={totalClicks.toLocaleString("fa-IR")} icon={MousePointerClick} />
      </div>

      <MarketingPanel contacts={contacts} />

      <MarketingCampaignHistory campaigns={campaigns} whatsappReachable={whatsappReachable} />
    </div>
  );
}
