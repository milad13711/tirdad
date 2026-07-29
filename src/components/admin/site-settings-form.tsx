"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SiteSettingsForm({ subscriptionPlansEnabled }: { subscriptionPlansEnabled: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(subscriptionPlansEnabled);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setError(null);
    setLoading(true);
    const next = !enabled;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionPlansEnabled: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره تنظیمات");
      setEnabled(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره تنظیمات");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold">نمایش پلن‌های اشتراک</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            وقتی خاموش باشه، بخش پلن‌ها از صفحه اصلی و امکان خرید/ارتقای اشتراک از پنل کاربری
            مخفی می‌شه — کاربرهایی که از قبل اشتراک فعال دارن همچنان می‌تونن مدیریتش کنن.
          </p>
        </div>
        <Button variant={enabled ? "default" : "outline"} onClick={toggle} disabled={loading}>
          {loading ? "..." : enabled ? "فعال" : "غیرفعال"}
        </Button>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
