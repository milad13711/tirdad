import { BarChart3, ImageIcon, TrendingUp } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { InstagramAnalysisForm } from "@/components/site/instagram-analysis-form";

const benefits = [
  { icon: ImageIcon, label: "بررسی بیو، هایلایت‌ها و عکس پروفایل" },
  { icon: BarChart3, label: "تحلیل نرخ تعامل و کیفیت محتوا" },
  { icon: TrendingUp, label: "پیشنهاد مشخص برای رشد و افزایش فروش" },
];

export function InstagramAnalysis() {
  return (
    <section id="page-analysis" className="py-24 md:py-32">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionLabel>قدم سوم: آنالیز رایگان پیج</SectionLabel>
            <SectionTitle className="mb-6">
              پیج اینستاگرامت چقدر
              <br /> آماده فروش است؟
            </SectionTitle>
            <p className="mb-8 leading-8 text-muted-foreground">
              قبل از اینکه برای تیزر یا CRM هزینه کنی، بذار مجید تیرداد رایگان پیجت رو بررسی کنه —
              دقیقاً بدونی از کجا شروع کنی.
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
