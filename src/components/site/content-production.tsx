import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { TeaserRequestForm } from "@/components/site/teaser-request-form";
import { TeaserSampleCard } from "@/components/site/teaser-sample-card";
import { getActiveTeaserSamples } from "@/lib/queries/teasers";

export async function ContentProduction() {
  const samples = await getActiveTeaserSamples(6);

  return (
    <section id="content-production" className="py-24 md:py-32">
      <Container>
        <Reveal className="mb-16 text-center">
          <div className="flex flex-col items-center">
            <SectionLabel>قدم سوم: تیزر تبلیغاتی اختصاصی</SectionLabel>
            <SectionTitle>
              وقتی آماده بودی، یک تیزر
              <br /> حرفه‌ای برای برندت بساز
            </SectionTitle>
            <p className="mt-6 max-w-2xl leading-8 text-muted-foreground">
              تیم مجید تیرداد، تیزر و محتوای اختصاصی متناسب با برند شما را می‌سازد — از
              همین نمونه‌کارها شروع کن، بعد فرم کنار همین بخش را پر کن تا با تو تماس بگیریم.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-start">
          {samples.length === 0 ? (
            <p className="text-center text-muted-foreground">به‌زودی نمونه‌کارها اینجا نمایش داده می‌شوند.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {samples.map((sample, index) => (
                <Reveal key={sample.id} delay={index * 0.07}>
                  <TeaserSampleCard
                    title={sample.title}
                    videoUrl={sample.videoUrl}
                    coverImage={sample.coverImage}
                  />
                </Reveal>
              ))}
            </div>
          )}

          <Reveal from="left">
            <TeaserRequestForm />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
