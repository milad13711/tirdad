import { BarChart3, ImageIcon, TrendingUp } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { InstagramAnalysisForm } from "@/components/site/instagram-analysis-form";

const benefits = [
  { icon: ImageIcon, label: "بررسی بیو، هایلایت و پروفایل" },
  { icon: BarChart3, label: "تحلیل تعامل و کیفیت محتوا" },
  { icon: TrendingUp, label: "نقشه راه برای جذب مشتری بیشتر" },
];

export function InstagramAnalysis() {
  return (
    <section id="page-analysis" className="py-24 md:py-32">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionLabel>۳. پیجت را عیب‌یابی کن</SectionLabel>
            <SectionTitle className="mb-6">
              شاید مشکل از محصولت
              <br /> نباشه؛ شاید پیجت باشه
            </SectionTitle>
            <p className="mb-8 leading-8 text-muted-foreground">
              گاهی یه بیوی ضعیف، هایلایت‌های نامرتب یا چند اشتباه ساده باعث می‌شه مخاطب وارد
              پیج بشه و بدون اینکه حتی دایرکت بده، خارج بشه. قبل از اینکه برای تبلیغات یا تولید
              محتوا هزینه کنی، بذار رایگان پیجت رو بررسی کنیم.
            </p>
            <div className="space-y-4">
              {benefits.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon size={16} />
                  </span>
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal from="left">
            <InstagramAnalysisForm />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
