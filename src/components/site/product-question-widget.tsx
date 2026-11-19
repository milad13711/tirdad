"use client";

import { useState } from "react";
import { HelpCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProductQuestionWidget({ productKey, campaignSlug }: { productKey: string; campaignSlug?: string }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!/^09\d{9}$/.test(phone.trim())) {
      setError("شماره موبایل را به‌درستی وارد کنید");
      return;
    }
    if (message.trim().length < 2) {
      setError("پیام خود را بنویسید");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey, campaignSlug, phone: phone.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ارسال ناموفق بود");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال ناموفق بود");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg md:bottom-6"
      >
        <HelpCircle size={16} />
        سوال دارید؟
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 z-40 w-72 rounded-xl border border-border bg-card p-4 shadow-xl md:bottom-6">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-bold">سوالتون رو بپرسید</h4>
        <button type="button" onClick={() => setOpen(false)} aria-label="بستن" className="text-muted-foreground">
          <X size={15} />
        </button>
      </div>
      {sent ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          پیام شما ثبت شد؛ تیم پشتیبانی به‌زودی باهاتون تماس می‌گیره.
        </p>
      ) : (
        <div className="space-y-2">
          <Input
            dir="ltr"
            inputMode="numeric"
            placeholder="شماره موبایل"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="text-left"
          />
          <textarea
            dir="rtl"
            rows={3}
            placeholder="سوالتون رو بنویسید..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button size="sm" className="w-full" onClick={handleSubmit} disabled={loading}>
            <Send size={14} />
            {loading ? "در حال ارسال..." : "ارسال"}
          </Button>
        </div>
      )}
    </div>
  );
}
