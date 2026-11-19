import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isYouTubeUrl, toYouTubeEmbedUrl } from "@/lib/youtube";
import { CheckCircle2, Download, Package } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Footer } from "@/components/site/footer";
import { Container } from "@/components/site/container";
import { Button } from "@/components/ui/button";
import { BuyButton } from "@/components/dashboard/buy-button";
import { getToolBySlug } from "@/lib/queries/tools-public";
import { getSiteSettings } from "@/lib/queries/settings";
import { getSiteContent } from "@/lib/site-content";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { PriceTag } from "@/components/site/price-tag";
import { SaleCountdown } from "@/components/site/sale-countdown";
import { getClientIp } from "@/lib/client-ip";
import { getEffectivePrice } from "@/lib/pricing";
import { productKey } from "@/lib/product-key";
import { CampaignTracker } from "@/components/site/campaign-tracker";
import { ProductQuestionWidget } from "@/components/site/product-question-widget";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const toolPackage = await getToolBySlug(slug);
  if (!toolPackage) return {};
  return {
    title: toolPackage.title,
    description: toolPackage.description ?? `پکیج ابزار ${toolPackage.title}`,
  };
}

export default async function ToolDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { slug } = await params;
  const { ref } = await searchParams;
  const [toolPackage, settings, content, session] = await Promise.all([
    getToolBySlug(slug),
    getSiteSettings(),
    getSiteContent(),
    getSession(),
  ]);
  if (!toolPackage) notFound();

  const isFree = toolPackage.price === 0;
  const isAdmin = session?.role === "ADMIN";
  const ip = await getClientIp();
  const { effectivePrice, saleEndsAt } = isFree
    ? { effectivePrice: 0, saleEndsAt: null }
    : await getEffectivePrice(
        {
          type: "TOOL_PACKAGE",
          id: toolPackage.id,
          price: toolPackage.price,
          salePrice: toolPackage.salePrice,
          saleCountdownHours: toolPackage.saleCountdownHours,
        },
        ip,
      );
  const purchase = !isFree && session
    ? await prisma.toolPackagePurchase.findUnique({
        where: { userId_toolPackageId: { userId: session.sub, toolPackageId: toolPackage.id } },
      })
    : null;

  // An unpublished package (admin editing it, or never finished) must stay
  // invisible to the public and to non-owners — but an existing owner or
  // an admin must still be able to reach it.
  if (!toolPackage.published && !purchase && !isAdmin) notFound();

  const canDownload = isFree || Boolean(purchase) || isAdmin;
  const pKey = productKey("TOOL_PACKAGE", toolPackage.id);

  return (
    <>
      <CampaignTracker productKey={pKey} campaignSlug={ref} />
      <ProductQuestionWidget productKey={pKey} campaignSlug={ref} />
      <Navbar
        showPricing={settings.subscriptionPlansEnabled}
        siteTitle={content.siteTitle}
        logoUrl={content.logoUrl}
      />
      <main className="flex-1 py-16 md:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div
              data-campaign-section="cover"
              className="relative mx-auto mb-6 aspect-[9/16] w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-secondary lg:mx-0"
            >
              {toolPackage.coverImage ? (
                <Image
                  src={toolPackage.coverImage}
                  alt={toolPackage.title}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Package size={40} />
                </div>
              )}
            </div>

            <h1 className="mb-4 text-2xl font-extrabold leading-10 md:text-3xl">{toolPackage.title}</h1>

            {toolPackage.category && (
              <div className="mb-8 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <span>{toolPackage.category}</span>
              </div>
            )}

            {toolPackage.demoVideoUrl && (
              <div data-campaign-section="demo_video" className="mb-8">
                <h2 className="mb-3 font-bold">پیش‌نمایش ویدیویی</h2>
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
                  {isYouTubeUrl(toolPackage.demoVideoUrl) ? (
                    <iframe
                      src={toYouTubeEmbedUrl(toolPackage.demoVideoUrl)}
                      title="پیش‌نمایش ویدیویی"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  ) : (
                    <video src={toolPackage.demoVideoUrl} controls className="h-full w-full" />
                  )}
                </div>
              </div>
            )}

            {toolPackage.description && (
              <div data-campaign-section="description">
                <h2 className="mb-3 font-bold">درباره این پکیج</h2>
                <p className="leading-8 text-muted-foreground">{toolPackage.description}</p>
              </div>
            )}
          </div>

          <aside data-campaign-section="price_buy_box" className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <div className="mb-5">
              <div className="text-2xl font-extrabold">
                {isFree ? (
                  "رایگان"
                ) : (
                  <PriceTag
                    price={toolPackage.price}
                    salePrice={effectivePrice === toolPackage.price ? null : effectivePrice}
                  />
                )}
              </div>
              {saleEndsAt && <SaleCountdown endsAt={saleEndsAt.toISOString()} />}
            </div>

            {canDownload ? (
              <>
                <Button asChild className="w-full">
                  <a href={`/api/tools/${toolPackage.id}/download`}>
                    <Download size={16} />
                    دانلود پکیج
                  </a>
                </Button>
                {purchase && (
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                    <CheckCircle2 size={13} />
                    شما این پکیج را قبلاً خریداری کرده‌اید.
                  </p>
                )}
              </>
            ) : (
              <BuyButton
                payload={{ itemType: "TOOL_PACKAGE", toolPackageId: toolPackage.id }}
                loggedIn={Boolean(session)}
                productKey={pKey}
                campaignSlug={ref}
                className="w-full"
              >
                خرید و دانلود پکیج
              </BuyButton>
            )}
          </aside>
        </Container>
      </main>
      <Footer siteTitle={content.siteTitle} logoUrl={content.logoUrl} />
      <MobileBottomNav showPricing={settings.subscriptionPlansEnabled} siteTitle={content.siteTitle} />
    </>
  );
}
