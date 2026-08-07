import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { getSession } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/queries/settings";
import { getSiteContent } from "@/lib/site-content";
import { getSmsSettings, getSmsTriggers } from "@/lib/queries/admin";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { SiteContentForm } from "@/components/admin/site-content-form";
import { SiteBrandingForm } from "@/components/admin/site-branding-form";
import { PushNotificationForm } from "@/components/admin/push-notification-form";
import { SmsSettingsPanel } from "@/components/admin/sms-settings-panel";

function maskApiKey(apiKey: string | null) {
  if (!apiKey) return null;
  return apiKey.length <= 4 ? "****" : `****${apiKey.slice(-4)}`;
}

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [settings, content, smsSettings, smsTriggers] = await Promise.all([
    getSiteSettings(),
    getSiteContent(),
    getSmsSettings(),
    getSmsTriggers(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="تنظیمات سایت" description="کلیدهای کلی و محتوای قابل‌ویرایش صفحه اصلی" />
      <SiteBrandingForm siteTitle={content.siteTitle} logoUrl={content.logoUrl} />
      <SiteSettingsForm subscriptionPlansEnabled={settings.subscriptionPlansEnabled} />
      <SiteContentForm content={content} />
      <PushNotificationForm />
      <SmsSettingsPanel
        connected={smsSettings?.enabled ?? false}
        senderNumber={smsSettings?.senderNumber ?? null}
        maskedApiKey={maskApiKey(smsSettings?.apiKey ?? null)}
        triggers={smsTriggers}
      />
    </div>
  );
}
