"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function InstagramLeadForm() {
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
          message: formData.get("message"),
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
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 text-sm text-primary">
        اطلاعاتت ثبت شد، به‌جای دایرکت از همینجا در سریع‌ترین زمان باهات تماس می‌گیریم.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-border bg-background p-5">
      <p className="text-sm font-medium">به‌جای دایرکت، اطلاعات تماست رو همینجا بگذار</p>
      <Input name="name" placeholder="اسمت" required />
      <Input name="phone" type="tel" placeholder="شماره موبایل" required />
      <Textarea name="message" placeholder="موضوع پیام (اختیاری)" rows={2} />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        <Send size={16} />
        {loading ? "در حال ارسال..." : "ارسال به تیرداد"}
      </Button>
    </form>
  );
}
