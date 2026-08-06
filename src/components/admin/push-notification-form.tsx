"use client";

import { useState, type FormEvent } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PushNotificationForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/admin/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          body: formData.get("body"),
          url: formData.get("url") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ارسال ناموفق بود");
      setResult(`برای ${data.sent} دستگاه ارسال شد${data.failed ? ` (${data.failed} ناموفق)` : ""}.`);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال ناموفق بود");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6">
      <div className="mb-1 flex items-center gap-2">
        <Bell size={16} className="text-primary" />
        <h3 className="font-bold">ارسال اعلان (Push Notification)</h3>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        به همه کاربرانی که اعلان‌ها را روی گوشی یا مرورگرشان فعال کرده‌اند ارسال می‌شود.
      </p>
      <div className="space-y-4">
        <div>
          <Label htmlFor="push-title">عنوان</Label>
          <Input id="push-title" name="title" placeholder="مثال: پرامپت جدید اضافه شد" required maxLength={80} />
        </div>
        <div>
          <Label htmlFor="push-body">متن پیام</Label>
          <Textarea id="push-body" name="body" required maxLength={200} rows={2} />
        </div>
        <div>
          <Label htmlFor="push-url">لینک مقصد (اختیاری — با کلیک روی اعلان باز می‌شود)</Label>
          <Input id="push-url" name="url" dir="ltr" placeholder="/prompts" />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {result && !error && <p className="mt-3 text-sm text-primary">{result}</p>}
      <Button className="mt-5" type="submit" disabled={loading}>
        {loading ? "در حال ارسال..." : "ارسال به همه"}
      </Button>
    </form>
  );
}
