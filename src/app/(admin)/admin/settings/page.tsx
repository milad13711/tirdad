import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { getSession } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/queries/settings";
import { getSiteContent } from "@/lib/site-content";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { SiteContentForm } from "@/components/admin/site-content-form";
import { SiteBrandingForm } from "@/components/admin/site-branding-form";
import { PushNotificationForm } from "@/components/admin/push-notification-form";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [settings, content] = await Promise.all([getSiteSettings(), getSiteContent()]);

  return (
    <div className="space-y-6">
      <PageHeader title="تنظیمات سایت" description="کلیدهای کلی و محتوای قابل‌ویرایش صفحه اصلی" />
      <SiteBrandingForm siteTitle={content.siteTitle} logoUrl={content.logoUrl} />
      <SiteSettingsForm subscriptionPlansEnabled={settings.subscriptionPlansEnabled} />
      <SiteContentForm content={content} />
      <PushNotificationForm />
    </div>
  );
}
