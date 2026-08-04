"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "پایه",
    highlighted: false,
    monthly: "۷۰۰٬۰۰۰",
    yearly: "۷٬۰۰۰٬۰۰۰",
    features: [
      "اتصال به اکانت اینستاگرام",
      "مانیتورینگ اینستاگرام از توی سایت خودت",
      "ثبت مشتریان بالقوه",
      "پیگیری پیامکی خودکار مشتریان",
    ],
  },
  {
    name: "پرو",
    highlighted: true,
    monthly: "۲٬۹۰۰٬۰۰۰",
    yearly: "۲۹٬۰۰۰٬۰۰۰",
    features: [
      "اتصال به اکانت اینستاگرام",
      "مانیتورینگ اینستاگرام از توی سایت خودت",
      "ثبت مشتریان بالقوه",
      "پیگیری پیامکی خودکار مشتریان",
      "اتصال به ربات بله برای حفظ ارتباط در زمان قطعی اینترنت بین‌المللی",
      "فروشگاه محصولات",
    ],
  },
] as const;

export function InstagramCrmPricing() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="mt-16">
      <div className="mb-10 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              period === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            ماهانه
          </button>
          <button
            type="button"
            onClick={() => setPeriod("yearly")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              period === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            سالانه
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
              ۲ ماه هدیه
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-2xl border p-8",
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
            <h3 className="text-lg font-bold text-muted-foreground">اشتراک {plan.name}</h3>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-4xl font-extrabold">
                {period === "monthly" ? plan.monthly : plan.yearly}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">
                تومان / {period === "monthly" ? "ماهانه" : "سالانه"}
              </span>
            </div>

            <ul className="my-8 flex-1 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button variant={plan.highlighted ? "default" : "outline"} className="w-full" asChild>
              <Link href="/login">شروع اشتراک {plan.name}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
