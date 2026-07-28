import { Clapperboard, GraduationCap, Sparkles, type LucideIcon } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { services } from "@/lib/content";

const icons: Record<string, LucideIcon> = {
  GraduationCap,
  Sparkles,
  Clapperboard,
};

export function Services() {
  return (
    <section id="services" className="py-24 md:py-32">
      <Container>
        <Reveal>
          <SectionLabel>خدمات ما</SectionLabel>
          <SectionTitle className="mb-16">
            هر آنچه برای رشد دیجیتال
            <br /> نیاز دارید
          </SectionTitle>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service, index) => {
            const Icon = icons[service.icon];
            return (
              <Reveal key={service.title} delay={index * 0.1}>
                <div className="group h-full rounded-xl border border-border bg-card p-8 transition-colors duration-300 hover:border-primary/40">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <Icon size={22} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{service.title}</h3>
                  <p className="leading-7 text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
