import { Navbar } from "@/components/site/navbar";
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

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Services />
        <Courses />
        <AiShowcase />
        <Pricing />
        <Testimonials />
        <InstagramCrm />
        <Faq />
        <Blog />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
