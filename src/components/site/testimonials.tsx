import { Quote } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { testimonials } from "@/lib/content";

export function Testimonials() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <Reveal className="mb-16 text-center">
          <div className="flex flex-col items-center">
            <SectionLabel>نظرات مشتریان</SectionLabel>
            <SectionTitle>اعتماد کسب‌وکارهای دیجیتال</SectionTitle>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 0.1}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-8">
                <Quote className="mb-4 text-primary/40" size={28} />
                <blockquote className="flex-1 leading-8 text-muted-foreground">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
