"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PurchasePayload =
  | { itemType: "COURSE"; courseId: string }
  | { itemType: "SUBSCRIPTION"; planId: string }
  | { itemType: "TOOL_PACKAGE"; toolPackageId: string }
  | { itemType: "PROMPT"; aiToolId: string };

export function BuyButton({
  payload,
  children,
  loggedIn = true,
  showCoupon = true,
  ...buttonProps
}: {
  payload: PurchasePayload;
  children: React.ReactNode;
  // When false, a mobile-number field is shown and sent as guestPhone —
  // the purchase itself creates/logs the buyer in by phone, no OTP step.
  loggedIn?: boolean;
  showCoupon?: boolean;
} & Omit<React.ComponentProps<typeof Button>, "onClick">) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [phone, setPhone] = useState("");

  async function handleClick() {
    setError(null);
    if (!loggedIn && !/^09\d{9}$/.test(phone.trim())) {
      setError("شماره موبایل را به‌درستی وارد کنید (مثال: 09xxxxxxxxx)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/payments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          couponCode: coupon.trim() || undefined,
          guestPhone: loggedIn ? undefined : phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در اتصال به درگاه پرداخت");
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در اتصال به درگاه پرداخت");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2.5">
      {!loggedIn && (
        <div>
          <Label htmlFor="guest-phone" className="text-xs">
            شماره موبایل (برای ساخت حساب و ارسال سفارش)
          </Label>
          <Input
            id="guest-phone"
            dir="ltr"
            inputMode="numeric"
            placeholder="09xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="text-left"
          />
        </div>
      )}
      {showCoupon && (
        <div>
          <Label htmlFor="coupon-code" className="text-xs">
            کد تخفیف (اختیاری)
          </Label>
          <Input
            id="coupon-code"
            dir="ltr"
            placeholder="مثال: WELCOME10"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="text-left"
          />
        </div>
      )}
      <Button {...buttonProps} onClick={handleClick} disabled={loading}>
        {loading ? "در حال اتصال به درگاه..." : children}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
