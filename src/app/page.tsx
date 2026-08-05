import { Navbar } from "@/components/site/navbar";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { HashScroll } from "@/components/site/hash-scroll";
import { ScrollDecor } from "@/components/site/scroll-decor";
import { Hero } from "@/components/site/hero";
import { Services } from "@/components/site/services";
import { Courses } from "@/components/site/courses";
import { AiShowcase } from "@/components/site/ai-showcase";
import { ContentProduction } from "@/components/site/content-production";
import { Pricing } from "@/components/site/pricing";
import { Testimonials } from "@/components/site/testimonials";
import { InstagramCrm } from "@/components/site/instagram";
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
      <Navbar showPricing={settings.subscriptionPlansEnabled} />
      {/*
        Section order follows the sales funnel, not just visual variety:
        1. Hero — the hook.
        2. AiShowcase — free prompts, a zero-friction way to try the brand
           before committing to anything (top of funnel).
        3. Services — the map of the whole journey, ending on the two
           highest-value offers (teaser production, Instagram CRM) so
           visitors see where the free stuff eventually leads.
        4. Courses — a paid but still self-serve step that builds trust
           before asking for a bigger commitment.
        5. Testimonials — social proof placed right before the two
           high-commitment asks below, not buried at the bottom.
        6. ContentProduction / InstagramCrm — the actual conversion points:
           a custom teaser, then the CRM that turns its traffic into sales.
        7. Pricing, Faq (objection handling), Blog, final Cta.
      */}
      <main className="relative flex-1">
        <ScrollDecor />
        <Hero content={content} />
        <AiShowcase />
        <Services />
        <Courses />
        <Testimonials />
        <ContentProduction />
        <InstagramCrm content={content} />
        {settings.subscriptionPlansEnabled && <Pricing />}
        <Faq />
        <Blog posts={posts} />
        <Cta showPricing={settings.subscriptionPlansEnabled} />
      </main>
      <Footer />
      <MobileBottomNav showPricing={settings.subscriptionPlansEnabled} />
    </>
  );
}
