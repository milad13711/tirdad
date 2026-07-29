import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BuyButton } from "@/components/dashboard/buy-button";
import { CancelSubscriptionButton } from "@/components/dashboard/cancel-subscription-button";
import { getSession } from "@/lib/auth/session";
import { formatJalaliDateTime, formatToman, getPlans, getUserOverview } from "@/lib/queries/dashboard";
import { cn } from "@/lib/utils";

export default async function SubscriptionPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [plans, overview] = await Promise.all([getPlans(), getUserOverview(session.sub)]);
  const { subscription, monthlyRunsUsed } = overview;
  const monthlyLimit = subscription?.plan.monthlyRunLimit ?? null;

  return (
    <div>
      <PageHeader title="اشتراک من" description="مدیریت پلن فعلی و ارتقای اشتراک" />

      <div className="mb-10 rounded-xl border border-primary/30 bg-primary/5 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">پلن فعلی شما</p>
            <p className="text-xl font-extrabold text-primary">
              {subscription?.plan.name ?? "رایگان"}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {subscription
              ? `تمدید بعدی: ${formatJalaliDateTime(subscription.currentPeriodEnd)}`
              : "بدون پلن فعال"}
          </div>
          {subscription && <CancelSubscriptionButton subscriptionId={subscription.id} />}
        </div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">اجرای ماهانه مصرف‌شده</span>
          <span>
            {monthlyRunsUsed} از {monthlyLimit ?? "نامحدود"}
          </span>
        </div>
        <Progress value={monthlyLimit ? (monthlyRunsUsed / monthlyLimit) * 100 : 100} />
      </div>

      <h3 className="mb-5 font-bold">ارتقا یا تغییر پلن</h3>
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === subscription?.planId;
          const isHighlighted = plan.slug === "pro";
          const features = plan.features as string[];
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7",
                isHighlighted ? "border-primary bg-primary/5" : "border-border bg-card",
              )}
            >
              {isCurrent && (
                <span className="absolute -top-3 right-7 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                  پلن فعلی
                </span>
              )}
              <h4 className="text-lg font-bold text-muted-foreground">{plan.name}</h4>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-extrabold">{formatToman(plan.price)}</span>
                <span className="mb-1 text-sm text-muted-foreground">
                  تومان / {plan.period === "monthly" ? "ماهانه" : plan.period}
                </span>
              </div>
              <ul className="my-6 flex-1 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button disabled variant="outline">
                  پلن فعلی شما
                </Button>
              ) : (
                <BuyButton className="w-full" payload={{ itemType: "SUBSCRIPTION", planId: plan.id }}>
                  ارتقا به این پلن
                </BuyButton>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
