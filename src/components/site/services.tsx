import Link from "next/link";
import { Clapperboard, GraduationCap, Sparkles } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";

const pillars = [
  {
    title: "پکیج آموزش تولید محتوا با هوش مصنوعی",
    description: "دوره‌های گام‌به‌گام تولید محتوا و رشد کسب‌وکار با هوش مصنوعی.",
    icon: GraduationCap,
    href: "#courses",
  },
  {
    title: "پرامپت‌های رایگان",
    description: "ده‌ها پرامپت آماده تصویر و ویدیو، رایگان و بدون نیاز به دانش فنی.",
    icon: Sparkles,
    href: "#ai-tools",
  },
  {
    title: "تولید محتوا یا تیزرهای حرفه‌ای سفارشی",
    description: "تیم ما تیزر و محتوای اختصاصی متناسب با برند شما تولید می‌کند.",
    icon: Clapperboard,
    href: "#content-production",
  },
] as const;

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
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.1}>
              <Link
                href={pillar.href}
                className="group block h-full rounded-xl border border-border bg-card p-8 transition-colors duration-300 hover:border-primary/40"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <pillar.icon size={22} />
                </div>
                <h3 className="mb-3 text-xl font-bold">{pillar.title}</h3>
                <p className="leading-7 text-muted-foreground">{pillar.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
