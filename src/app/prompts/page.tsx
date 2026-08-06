import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Footer } from "@/components/site/footer";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { PromptGallery } from "@/components/site/prompt-gallery";
import { getPromptsGalleryFirstPage } from "@/lib/queries/prompts";
import { getSiteSettings } from "@/lib/queries/settings";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "گالری پرامپت‌های رایگان",
  description:
    "مجموعه پرامپت‌های رایگان تولید تصویر، ویدیو و صدا با هوش مصنوعی — جستجو و فیلتر بر اساس دسته‌بندی و تگ.",
};

export default async function PromptsGalleryPage() {
  const [firstPage, settings, content] = await Promise.all([
    getPromptsGalleryFirstPage(),
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
              <SectionLabel>پرامپت‌های رایگان</SectionLabel>
              <SectionTitle>گالری کامل پرامپت‌ها</SectionTitle>
            </div>
          </div>
          <PromptGallery initial={firstPage} />
        </Container>
      </main>
      <Footer siteTitle={content.siteTitle} logoUrl={content.logoUrl} />
      <MobileBottomNav showPricing={settings.subscriptionPlansEnabled} siteTitle={content.siteTitle} />
    </>
  );
}
