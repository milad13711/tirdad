import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { formatToman } from "@/lib/format";

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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [toolPackage, settings, content, session] = await Promise.all([
    getToolBySlug(slug),
    getSiteSettings(),
    getSiteContent(),
    getSession(),
  ]);
  if (!toolPackage) notFound();

  const isFree = toolPackage.price === 0;
  const purchase = !isFree && session
    ? await prisma.toolPackagePurchase.findUnique({
        where: { userId_toolPackageId: { userId: session.sub, toolPackageId: toolPackage.id } },
      })
    : null;
  const canDownload = isFree || Boolean(purchase) || session?.role === "ADMIN";

  return (
    <>
      <Navbar
        showPricing={settings.subscriptionPlansEnabled}
        siteTitle={content.siteTitle}
        logoUrl={content.logoUrl}
      />
      <main className="flex-1 py-16 md:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-6 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-secondary">
              {toolPackage.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={toolPackage.coverImage}
                  alt={toolPackage.title}
                  className="h-full w-full object-cover"
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

            {toolPackage.description && (
              <div>
                <h2 className="mb-3 font-bold">درباره این پکیج</h2>
                <p className="leading-8 text-muted-foreground">{toolPackage.description}</p>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <div className="mb-5 text-2xl font-extrabold">
              {isFree ? "رایگان" : `${formatToman(toolPackage.price)} تومان`}
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
            ) : session ? (
              <BuyButton payload={{ itemType: "TOOL_PACKAGE", toolPackageId: toolPackage.id }} className="w-full">
                خرید و دانلود پکیج
              </BuyButton>
            ) : (
              <>
                <Button asChild className="w-full">
                  <a href="/login">ورود برای خرید پکیج</a>
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  برای خرید ابتدا وارد حساب کاربری خود شوید.
                </p>
              </>
            )}
          </aside>
        </Container>
      </main>
      <Footer siteTitle={content.siteTitle} logoUrl={content.logoUrl} />
      <MobileBottomNav showPricing={settings.subscriptionPlansEnabled} siteTitle={content.siteTitle} />
    </>
  );
}
