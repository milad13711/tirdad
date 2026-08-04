import { PlayCircle } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { TeaserRequestForm } from "@/components/site/teaser-request-form";
import { getActiveTeaserSamples } from "@/lib/queries/teasers";

export async function ContentProduction() {
  const samples = await getActiveTeaserSamples(6);

  return (
    <section id="content-production" className="py-24 md:py-32">
      <Container>
        <Reveal className="mb-16 text-center">
          <div className="flex flex-col items-center">
            <SectionLabel>تولید محتوا</SectionLabel>
            <SectionTitle>
              تیزر و محتوای حرفه‌ای
              <br /> سفارشی برای برند شما
            </SectionTitle>
            <p className="mt-6 max-w-2xl leading-8 text-muted-foreground">
              نمونه‌ای از تیزرهایی که برای کسب‌وکارها تولید کرده‌ایم — پروژه بعدی می‌تواند
              مال شما باشد.
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
                  {sample.videoUrl ? (
                    <a
                      href={sample.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block aspect-video overflow-hidden rounded-xl border border-border bg-secondary"
                    >
                      {sample.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sample.coverImage} alt={sample.title} className="h-full w-full object-cover" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <PlayCircle size={36} className="text-white" />
                      </div>
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-medium text-white">
                        {sample.title}
                      </span>
                    </a>
                  ) : (
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-secondary">
                      {sample.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sample.coverImage} alt={sample.title} className="h-full w-full object-cover" />
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-medium text-white">
                        {sample.title}
                      </span>
                    </div>
                  )}
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
