import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";

// The payoff step: no CTA of its own, no form — after prompts, courses,
// page analysis, and tool packages, this is the "here's what it adds up to"
// statement that sets up Testimonials (proof) and the final Cta (ask).
export function ScaleSales() {
  return (
    <section className="py-24 md:py-32">
      <Container className="max-w-3xl text-center">
        <Reveal>
          <div className="flex flex-col items-center">
            <SectionLabel>۵. فروش را مقیاس‌پذیر کن</SectionLabel>
            <SectionTitle className="mb-6">
              وقتی سیستم داشته باشی،
              <br /> فروش دیگر شانسی نیست
            </SectionTitle>
            <p className="leading-8 text-muted-foreground">
              وقتی محتوا، جذب مشتری و پیگیری همه توی یک مسیر مشخص باشه، رشد کسب‌وکارت
              قابل پیش‌بینی‌تر می‌شه. اون موقع به‌جای اینکه هر روز از صفر شروع کنی، هر ماه
              روی نتیجه ماه قبلت رشد می‌کنی.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
