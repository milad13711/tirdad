import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { PromptTypeToggle } from "@/components/site/prompt-type-toggle";
import { getFeaturedPromptsByType } from "@/lib/queries/prompts";

export async function AiShowcase() {
  const { image, video } = await getFeaturedPromptsByType(3);
  if (image.length === 0 && video.length === 0) return null;

  return (
    <section id="ai-tools" className="py-24 md:py-32">
      <Container>
        <Reveal className="mb-16 text-center">
          <div className="flex flex-col items-center">
            <SectionLabel>قدم اول: رایگان امتحان کن</SectionLabel>
            <SectionTitle>
              پرامپت‌های رایگان
              <br /> آماده استفاده
            </SectionTitle>
            <p className="mt-6 max-w-2xl leading-8 text-muted-foreground">
              ده‌ها پرامپت حرفه‌ای تصویر و ویدیو که همین حالا، بدون ثبت‌نام و بدون
              نیاز به دانش فنی، می‌توانید استفاده کنید.
            </p>
          </div>
        </Reveal>

        <PromptTypeToggle image={image} video={video} />

        <div className="mt-10 text-center">
          <Link
            href="/prompts"
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            نمایش همه پرامپت‌ها
            <ArrowLeft size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
