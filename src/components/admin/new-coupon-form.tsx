"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewCouponForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.get("code"),
          discountPercent: formData.get("discountPercent"),
          usageLimit: formData.get("usageLimit") || undefined,
          expiresAt: formData.get("expiresAt") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره کد تخفیف");
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره کد تخفیف");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rounded-xl border border-border bg-card p-6" onSubmit={handleSubmit}>
      <div className="mb-5 flex items-center gap-2">
        <Plus size={16} className="text-primary" />
        <h3 className="font-bold">ساخت کد تخفیف</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <Label htmlFor="coupon-code">کد</Label>
          <Input id="coupon-code" name="code" dir="ltr" placeholder="TIRDAD20" required />
        </div>
        <div>
          <Label htmlFor="coupon-percent">درصد تخفیف</Label>
          <Input
            id="coupon-percent"
            name="discountPercent"
            type="number"
            min={1}
            max={100}
            placeholder="۲۰"
            required
          />
        </div>
        <div>
          <Label htmlFor="coupon-limit">سقف استفاده (اختیاری)</Label>
          <Input id="coupon-limit" name="usageLimit" type="number" min={1} placeholder="۱۰۰" />
        </div>
        <div>
          <Label htmlFor="coupon-expires">تاریخ انقضا (اختیاری)</Label>
          <Input id="coupon-expires" name="expiresAt" type="date" />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <Button className="mt-5" type="submit" disabled={loading}>
        {loading ? "در حال ذخیره..." : "ذخیره کد تخفیف"}
      </Button>
    </form>
  );
}
