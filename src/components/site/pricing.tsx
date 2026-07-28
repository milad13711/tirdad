import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { plans } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32">
      <Container>
        <Reveal className="mb-16 text-center">
          <div className="flex flex-col items-center">
            <SectionLabel>پلن‌های اشتراک</SectionLabel>
            <SectionTitle>پلنی متناسب با نیاز شما</SectionTitle>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 0.1}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-8",
                  plan.highlighted
                    ? "border-primary bg-primary/5 shadow-[0_24px_48px_-16px_rgba(26,127,255,0.35)]"
                    : "border-border bg-card",
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 right-8 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    محبوب‌ترین
                  </span>
                )}
                <h3 className="text-lg font-bold text-muted-foreground">{plan.name}</h3>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="mb-1 text-sm text-muted-foreground">
                    تومان / {plan.period}
                  </span>
                </div>
                <p className="mt-2 text-sm text-primary">{plan.runsPerMonth}</p>

                <ul className="my-8 flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant={plan.highlighted ? "default" : "outline"} className="w-full">
                  انتخاب پلن {plan.name}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
