import { Navbar } from "@/components/site/navbar";
import { BackgroundVideo } from "@/components/site/background-video";
import { Hero } from "@/components/site/hero";
import { Services } from "@/components/site/services";
import { Courses } from "@/components/site/courses";
import { AiShowcase } from "@/components/site/ai-showcase";
import { Pricing } from "@/components/site/pricing";
import { Testimonials } from "@/components/site/testimonials";
import { InstagramCrm } from "@/components/site/instagram";
import { Faq } from "@/components/site/faq";
import { Blog } from "@/components/site/blog";
import { Cta } from "@/components/site/cta";
import { Footer } from "@/components/site/footer";
import { getSiteSettings } from "@/lib/queries/settings";

// Otherwise Next prerenders this page once at build time — an admin toggling
// subscriptionPlansEnabled from /admin/settings wouldn't take effect on the
// live site until the next deploy.
export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <>
      <BackgroundVideo />
      <Navbar showPricing={settings.subscriptionPlansEnabled} />
      <main className="flex-1">
        <Hero />
        <Services />
        <Courses />
        <AiShowcase />
        {settings.subscriptionPlansEnabled && <Pricing />}
        <Testimonials />
        <InstagramCrm />
        <Faq />
        <Blog />
        <Cta showPricing={settings.subscriptionPlansEnabled} />
      </main>
      <Footer />
    </>
  );
}
