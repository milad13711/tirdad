"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TeaserRequestForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          message: "درخواست تیزر تبلیغاتی سفارشی",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطایی رخ داد");
      setDone(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 text-sm text-primary">
        درخواستت ثبت شد، به‌زودی برای بررسی پروژه باهات تماس می‌گیریم.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border bg-card p-6">
      <p className="mb-1 font-bold">درخواست تیزر اختصاصی</p>
      <p className="mb-4 text-sm text-muted-foreground">
        اسم و شماره‌ت رو بگذار، درباره پروژه‌ات باهات تماس می‌گیریم.
      </p>
      <Input name="name" placeholder="اسمت" required />
      <Input name="phone" type="tel" placeholder="شماره موبایل" required />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        <Send size={16} />
        {loading ? "در حال ارسال..." : "درخواست تیزر"}
      </Button>
    </form>
  );
}
