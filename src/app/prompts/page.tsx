import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Footer } from "@/components/site/footer";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { PromptGallery } from "@/components/site/prompt-gallery";
import { getPromptsGalleryFirstPage, getPurchasedPromptIds } from "@/lib/queries/prompts";
import { getSiteSettings } from "@/lib/queries/settings";
import { getSiteContent } from "@/lib/site-content";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "گالری پرامپت‌ها",
  description:
    "مجموعه پرامپت‌های رایگان و پریمیوم تولید تصویر، ویدیو و صدا با هوش مصنوعی — جستجو و فیلتر بر اساس دسته‌بندی کسب‌وکار.",
};

export default async function PromptsGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ purchased?: string }>;
}) {
  const { purchased } = await searchParams;
  const session = await getSession();
  const purchasedIds = await getPurchasedPromptIds(session?.sub ?? null);
  const [firstPage, settings, content] = await Promise.all([
    getPromptsGalleryFirstPage(purchasedIds, purchased),
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
              <SectionLabel>پرامپت‌های رایگان و پریمیوم</SectionLabel>
              <SectionTitle>گالری کامل پرامپت‌ها</SectionTitle>
            </div>
          </div>
          <PromptGallery initial={firstPage} highlightId={purchased} />
        </Container>
      </main>
      <Footer siteTitle={content.siteTitle} logoUrl={content.logoUrl} />
      <MobileBottomNav showPricing={settings.subscriptionPlansEnabled} siteTitle={content.siteTitle} />
    </>
  );
}
