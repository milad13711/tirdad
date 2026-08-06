import Link from "next/link";
import { GraduationCap, ScanSearch, Sparkles, Users } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";

// Ordered as a journey, not a random feature list: try something free →
// go deeper with a paid course → get a professional teaser made for you →
// manage the customers that teaser brings in. Step numbers make that
// progression explicit instead of leaving visitors to infer it.
const pillars = [
  {
    step: "۱",
    title: "پرامپت‌های رایگان",
    description: "قبل از رقیبات، همین حالا و بدون ثبت‌نام، هوش مصنوعی را رایگان امتحان کن.",
    icon: Sparkles,
    href: "#ai-tools",
  },
  {
    step: "۲",
    title: "پکیج‌های آموزشی",
    description: "یاد بگیر و از بقیه جلو بیفت — گام‌به‌گام، بدون پیچیدگی و بدون نیاز به دانش فنی.",
    icon: GraduationCap,
    href: "#courses",
  },
  {
    step: "۳",
    title: "آنالیز رایگان پیج اینستاگرام",
    description: "قبل از هر هزینه‌ای، بذار رایگان بررسی کنیم پیجت دقیقاً از کجا عقب مانده.",
    icon: ScanSearch,
    href: "#page-analysis",
  },
  {
    step: "۴",
    title: "CRM مدیریت مشتریان اینستاگرام",
    description: "دیگر هیچ لید و مشتری بالقوه‌ای را از دست نده، تا مرحله فروش نهایی پیگیری کن.",
    icon: Users,
    href: "#instagram-crm",
  },
] as const;

export function Services() {
  return (
    <section id="services" className="py-24 md:py-32">
      <Container>
        <Reveal>
          <SectionLabel>مسیری که رقبات دارند طی می‌کنند</SectionLabel>
          <SectionTitle className="mb-16">
            از امتحان رایگان تا
            <br /> مشتری‌های واقعی
          </SectionTitle>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.1}>
              <Link
                href={pillar.href}
                className="group block h-full rounded-xl border border-border bg-card p-8 transition-colors duration-300 hover:border-primary/40"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <pillar.icon size={22} />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground/50">{pillar.step}</span>
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
