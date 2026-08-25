import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Footer } from "@/components/site/footer";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { PublicToolCard } from "@/components/site/public-tool-card";
import { getAllPublishedTools } from "@/lib/queries/tools-public";
import { getSiteSettings } from "@/lib/queries/settings";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "همه ابزارها",
  description: "پکیج‌های آماده و قابل دانلود تیرداد: فونت، افکت و ابزارهای تولید محتوا.",
};

export default async function ToolsArchivePage() {
  const [toolPackages, settings, content] = await Promise.all([
    getAllPublishedTools(),
    getSiteSettings(),
    getSiteContent(),
  ]);

  return (
    <>
      <Navbar
        showPricing={settings.subscriptionPlansEnabled}
        siteTitle={content.siteTitle}
        logoUrl={content.logoUrl}
      />
      <main className="flex-1 py-24 md:py-32">
        <Container>
          <div className="mb-12 text-center">
            <div className="flex flex-col items-center">
              <SectionLabel>ابزارها</SectionLabel>
              <SectionTitle>همه ابزارهای کاربردی</SectionTitle>
            </div>
          </div>
          {toolPackages.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">در حال حاضر ابزاری منتشر نشده است.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {toolPackages.map((toolPackage) => (
                <PublicToolCard key={toolPackage.id} toolPackage={toolPackage} />
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer siteTitle={content.siteTitle} logoUrl={content.logoUrl} />
      <MobileBottomNav showPricing={settings.subscriptionPlansEnabled} siteTitle={content.siteTitle} />
    </>
  );
}
