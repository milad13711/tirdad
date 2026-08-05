import { Navbar } from "@/components/site/navbar";
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
      <Navbar showPricing={settings.subscriptionPlansEnabled} />
      <main className="relative flex-1">
        <ScrollDecor />
        <Hero content={content} />
        <Services />
        <Courses />
        <AiShowcase />
        <ContentProduction />
        {settings.subscriptionPlansEnabled && <Pricing />}
        <Testimonials />
        <InstagramCrm content={content} />
        <Faq />
        <Blog posts={posts} />
        <Cta showPricing={settings.subscriptionPlansEnabled} />
      </main>
      <Footer />
    </>
  );
}
