"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InstagramAnalysisForm() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScreenshotChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setScreenshotError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/leads/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در آپلود اسکرین‌شات");
      setScreenshotUrl(data.url);
    } catch (err) {
      setScreenshotError(err instanceof Error ? err.message : "خطا در آپلود اسکرین‌شات");
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  }

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
          pageUrl: formData.get("pageUrl"),
          attachmentUrl: screenshotUrl || undefined,
          message: "درخواست آنالیز رایگان پیج اینستاگرام",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطایی رخ داد");
      setDone(true);
      form.reset();
      setScreenshotUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 text-sm text-primary">
        درخواستت ثبت شد. پیج و بیوت رو بررسی می‌کنیم و نتیجه رو باهات در میان می‌ذاریم.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border bg-card p-6">
      <p className="mb-1 font-bold">درخواست آنالیز رایگان پیج</p>
      <p className="mb-4 text-sm text-muted-foreground">
        اسم، شماره و آدرس پیج اینستاگرامت رو بگذار، رایگان بررسیش می‌کنیم و نقاط ضعف و قوتش رو
        باهات در میان می‌ذاریم.
      </p>
      <Input name="name" placeholder="اسمت" required />
      <Input name="phone" type="tel" placeholder="شماره موبایل" required />
      <Input name="pageUrl" dir="ltr" placeholder="آدرس پیج (مثلاً instagram.com/yourpage)" required />

      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Camera size={13} />
          اسکرین‌شات صفحه بیو (اختیاری، ولی آنالیز دقیق‌تری می‌دهد)
        </label>
        <Input type="file" accept="image/*" onChange={handleScreenshotChange} />
        {uploading && <p className="mt-1 text-xs text-muted-foreground">در حال آپلود...</p>}
        {screenshotError && <p className="mt-1 text-xs text-destructive">{screenshotError}</p>}
        {screenshotUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={screenshotUrl} alt="" className="mt-2 h-32 w-full rounded-lg object-cover" />
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" disabled={loading || uploading} className="w-full">
        <Send size={16} />
        {loading ? "در حال ارسال..." : "درخواست آنالیز رایگان"}
      </Button>
    </form>
  );
}
