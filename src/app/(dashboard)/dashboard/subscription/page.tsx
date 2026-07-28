import { Check } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { plans } from "@/lib/content";
import { currentUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function SubscriptionPage() {
  return (
    <div>
      <PageHeader title="اشتراک من" description="مدیریت پلن فعلی و ارتقای اشتراک" />

      <div className="mb-10 rounded-xl border border-primary/30 bg-primary/5 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">پلن فعلی شما</p>
            <p className="text-xl font-extrabold text-primary">{currentUser.plan}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            تمدید بعدی: {currentUser.planRenewsAt}
          </div>
          <Button variant="outline" size="sm">
            لغو اشتراک
          </Button>
        </div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">اجرای ماهانه مصرف‌شده</span>
          <span>
            {currentUser.monthlyRunsUsed} از {currentUser.monthlyRunsLimit}
          </span>
        </div>
        <Progress value={(currentUser.monthlyRunsUsed / currentUser.monthlyRunsLimit) * 100} />
      </div>

      <h3 className="mb-5 font-bold">ارتقا یا تغییر پلن</h3>
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.name === currentUser.plan;
          return (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7",
                plan.highlighted ? "border-primary bg-primary/5" : "border-border bg-card",
              )}
            >
              {isCurrent && (
                <span className="absolute -top-3 right-7 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                  پلن فعلی
                </span>
              )}
              <h4 className="text-lg font-bold text-muted-foreground">{plan.name}</h4>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-extrabold">{plan.price}</span>
                <span className="mb-1 text-sm text-muted-foreground">
                  تومان / {plan.period}
                </span>
              </div>
              <ul className="my-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button disabled={isCurrent} variant={isCurrent ? "outline" : "default"}>
                {isCurrent ? "پلن فعلی شما" : "ارتقا به این پلن"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
