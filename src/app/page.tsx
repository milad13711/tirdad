import { Navbar } from "@/components/site/navbar";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { HashScroll } from "@/components/site/hash-scroll";
import { ScrollDecor } from "@/components/site/scroll-decor";
import { Hero } from "@/components/site/hero";
import { Services } from "@/components/site/services";
import { Courses } from "@/components/site/courses";
import { AiShowcase } from "@/components/site/ai-showcase";
import { InstagramAnalysis } from "@/components/site/instagram-analysis";
import { Tools } from "@/components/site/tools";
import { ScaleSales } from "@/components/site/scale-sales";
import { Pricing } from "@/components/site/pricing";
import { Testimonials } from "@/components/site/testimonials";
import { Faq } from "@/components/site/faq";
import { Blog } from "@/components/site/blog";
import { Cta } from "@/components/site/cta";
import { Footer } from "@/components/site/footer";
import { getSiteSettings } from "@/lib/queries/settings";
import { getSiteContent } from "@/lib/site-content";
import { getPublishedBlogPosts } from "@/lib/queries/blog";

// Otherwise Next prerenders this page once at build time — an admin toggling
// subscriptionPlansEnabled from /admin/settings wouldn't take effect on the
// live site until the next deploy.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, content, posts] = await Promise.all([
    getSiteSettings(),
    getSiteContent(),
    getPublishedBlogPosts(3),
  ]);

  return (
    <>
      <HashScroll />
      <Navbar
        showPricing={settings.subscriptionPlansEnabled}
        siteTitle={content.siteTitle}
        logoUrl={content.logoUrl}
      />
      {/*
        Section order follows the 5-step narrative: Hero (hook) ->
        InstagramAnalysis (the flagship, highest-intent service — free page
        analysis leads convert best, so it leads) -> Services (map of the
        rest of the journey) -> free prompts -> courses -> downloadable tool
        packages -> "scale sales", the payoff statement with no CTA of its
        own -> Testimonials (proof, right after the pitch) ->
        Pricing/Faq/Blog (supplementary, objection-handling) -> final Cta.
        The Instagram-CRM section+pricing is deliberately not rendered here
        for now (hidden from landing/nav, not deleted — see instagram.tsx
        and instagram-crm-pricing.tsx) while the tool-packages feature
        takes its place as a later step.
      */}
      <main className="relative flex-1">
        <ScrollDecor />
        <Hero content={content} />
        <InstagramAnalysis />
        <Services />
        <AiShowcase />
        <Courses />
        <Tools />
        <ScaleSales />
        <Testimonials />
        {settings.subscriptionPlansEnabled && <Pricing />}
        <Faq />
        <Blog posts={posts} />
        <Cta showPricing={settings.subscriptionPlansEnabled} />
      </main>
      <Footer siteTitle={content.siteTitle} logoUrl={content.logoUrl} />
      <MobileBottomNav showPricing={settings.subscriptionPlansEnabled} siteTitle={content.siteTitle} />
    </>
  );
}
