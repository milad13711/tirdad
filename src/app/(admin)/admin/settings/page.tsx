import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { getSession } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/queries/settings";
import { getSiteContent } from "@/lib/site-content";
import { getSmsSettings, getSmsTriggers, getVpnConfig } from "@/lib/queries/admin";
import { getMessengerConnections } from "@/lib/queries/messengers";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { SiteContentForm } from "@/components/admin/site-content-form";
import { SiteBrandingForm } from "@/components/admin/site-branding-form";
import { PushNotificationForm } from "@/components/admin/push-notification-form";
import { SmsSettingsPanel } from "@/components/admin/sms-settings-panel";
import { MessengerConnectionPanel } from "@/components/admin/messenger-connection-panel";
import { VpnConfigPanel } from "@/components/admin/vpn-config-panel";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { maskVpnConfig } from "@/lib/vpn";

function maskApiKey(apiKey: string | null) {
  if (!apiKey) return null;
  return apiKey.length <= 4 ? "****" : `****${apiKey.slice(-4)}`;
}

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [settings, content, smsSettings, smsTriggers, messengerConnections, vpnConfig] = await Promise.all([
    getSiteSettings(),
    getSiteContent(),
    getSmsSettings(),
    getSmsTriggers(),
    getMessengerConnections(),
    getVpnConfig(),
  ]);

  return (
    <div>
      <PageHeader title="تنظیمات سایت" description="کلیدهای کلی و محتوای قابل‌ویرایش صفحه اصلی" />

      <AdminTabs
        tabs={[
          {
            key: "general",
            label: "عمومی",
            content: (
              <>
                <SiteBrandingForm siteTitle={content.siteTitle} logoUrl={content.logoUrl} />
                <SiteSettingsForm subscriptionPlansEnabled={settings.subscriptionPlansEnabled} />
                <SiteContentForm content={content} />
              </>
            ),
          },
          {
            key: "notifications",
            label: "اعلان‌ها",
            content: <PushNotificationForm />,
          },
          {
            key: "sms",
            label: "پیامک",
            content: (
              <SmsSettingsPanel
                connected={smsSettings?.enabled ?? false}
                senderNumber={smsSettings?.senderNumber ?? null}
                maskedApiKey={maskApiKey(smsSettings?.apiKey ?? null)}
                triggers={smsTriggers}
              />
            ),
          },
          {
            key: "messengers",
            label: "پیام‌رسان‌ها",
            content: (
              <MessengerConnectionPanel
                connections={messengerConnections.filter(
                  (c): c is typeof c & { provider: "TELEGRAM" | "BALE" } =>
                    c.provider === "TELEGRAM" || c.provider === "BALE",
                )}
                whatsapp={
                  messengerConnections.find((c) => c.provider === "WHATSAPP") ?? {
                    botUsername: null,
                    connectedAt: null,
                    phoneNumberId: null,
                  }
                }
              />
            ),
          },
          {
            key: "vpn",
            label: "VPN",
            content: (
              <VpnConfigPanel
                connected={Boolean(vpnConfig?.enabled && vpnConfig.configUrl)}
                maskedConfig={vpnConfig?.configUrl ? maskVpnConfig(vpnConfig.configUrl) : null}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
