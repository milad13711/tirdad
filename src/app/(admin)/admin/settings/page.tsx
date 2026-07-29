import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { getSession } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/queries/settings";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const settings = await getSiteSettings();

  return (
    <div>
      <PageHeader title="تنظیمات سایت" description="کلیدهای کلی نمایش/عدم‌نمایش بخش‌های سایت" />
      <SiteSettingsForm subscriptionPlansEnabled={settings.subscriptionPlansEnabled} />
    </div>
  );
}
