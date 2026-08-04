import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { PublicPromptCard } from "@/components/site/public-prompt-card";
import { getFeaturedPrompts } from "@/lib/queries/prompts";

export async function AiShowcase() {
  const prompts = await getFeaturedPrompts(3);
  if (prompts.length === 0) return null;

  return (
    <section id="ai-tools" className="py-24 md:py-32">
      <Container>
        <Reveal className="mb-16 text-center">
          <div className="flex flex-col items-center">
            <SectionLabel>ابزارهای هوش مصنوعی</SectionLabel>
            <SectionTitle>
              پرامپت‌های رایگان
              <br /> آماده استفاده
            </SectionTitle>
            <p className="mt-6 max-w-2xl leading-8 text-muted-foreground">
              نمونه‌ای از ده‌ها پرامپت حرفه‌ای تصویر، ویدیو و صدا که همین حالا می‌توانید
              استفاده کنید — رایگان و بدون نیاز به دانش فنی.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {prompts.map((prompt, index) => (
            <Reveal key={prompt.id} delay={index * 0.1}>
              <PublicPromptCard prompt={prompt} />
            </Reveal>
          ))}
        </div>

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
