import { CheckCircle2 } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { InstagramLeadForm } from "@/components/site/instagram-lead-form";
import { InstagramCrmPricing } from "@/components/site/instagram-crm-pricing";
import type { SiteContent } from "@/lib/site-content";

const highlights = [
  "مدیریت دایرکت و کامنت",
  "ثبت خودکار لیدها",
  "پیگیری مراحل فروش",
  "گزارش عملکرد تیم",
  "پیامک و اتوماسیون",
];

export function InstagramCrm({ content }: { content: SiteContent }) {
  const [titleLine1, titleLine2] = content.instagramTitle.split("\n");

  return (
    <section id="instagram-crm" className="py-24 md:py-32">
      <Container>
        <div className="grid items-center gap-16 rounded-3xl border border-border bg-card p-8 md:p-16 lg:grid-cols-2">
          <Reveal>
            <SectionLabel>۴. مشتری‌ها را حفظ کن</SectionLabel>
            <SectionTitle className="mb-6">
              {titleLine1}
              {titleLine2 && (
                <>
                  <br /> {titleLine2}
                </>
              )}
            </SectionTitle>
            <p className="mb-8 leading-8 text-muted-foreground">{content.instagramDescription}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {highlights.map((label) => (
                <div key={label} className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal from="left" className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>قیف فروش این هفته</span>
                <span className="text-primary">۱۲۴ لید جدید</span>
              </div>
              {[
                { label: "جدید", value: 44, color: "bg-primary" },
                { label: "تماس گرفته شد", value: 30, color: "bg-primary/70" },
                { label: "پیشنهاد ارسال شد", value: 18, color: "bg-primary/50" },
                { label: "تبدیل شد", value: 12, color: "bg-primary/30" },
              ].map((row) => (
                <div key={row.label} className="mb-4 last:mb-0">
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>{row.label}</span>
                    <span>{row.value}٪</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{ width: `${row.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <InstagramLeadForm />
          </Reveal>
        </div>

        <InstagramCrmPricing />
      </Container>
    </section>
  );
}
