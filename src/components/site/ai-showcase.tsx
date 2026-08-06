import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { PromptTypeToggle } from "@/components/site/prompt-type-toggle";
import { getFeaturedPromptsByType, getPurchasedPromptIds } from "@/lib/queries/prompts";
import { getSession } from "@/lib/auth/session";

export async function AiShowcase() {
  const session = await getSession();
  const purchasedIds = await getPurchasedPromptIds(session?.sub ?? null);
  const { image, video } = await getFeaturedPromptsByType(3, purchasedIds);
  if (image.length === 0 && video.length === 0) return null;

  return (
    <section id="ai-tools" className="py-24 md:py-32">
      <Container>
        <Reveal className="mb-16 text-center">
          <div className="flex flex-col items-center">
            <SectionLabel>۱. رایگان امتحان کن</SectionLabel>
            <SectionTitle>
              پرامپت‌های رایگان
              <br /> آماده استفاده
            </SectionTitle>
            <p className="mt-6 max-w-2xl leading-8 text-muted-foreground">
              اول خودت نتیجه رو ببین، بعد تصمیم بگیر. با پرامپت‌های آماده، فقط توی چند دقیقه
              تصویر و ویدئوهایی بساز که قبلاً شاید ساعت‌ها وقتت رو می‌گرفت. رایگانه، ساده‌ست و
              فقط کافیه امتحانش کنی.
            </p>
          </div>
        </Reveal>

        <PromptTypeToggle image={image} video={video} />

        <div className="mt-10 text-center">
          <Link
            href="/prompts"
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            مشاهده پرامپت‌های رایگان
            <ArrowLeft size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
