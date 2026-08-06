"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SiteBrandingForm({
  siteTitle,
  logoUrl,
}: {
  siteTitle: string;
  logoUrl: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(siteTitle);
  const [logo, setLogo] = useState(logoUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "branding");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در آپلود لوگو");
      setLogo(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "خطا در آپلود لوگو");
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteTitle: title, logoUrl: logo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره تنظیمات");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره تنظیمات");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-1 font-bold">لوگو و نام سایت</h3>
      <p className="mb-5 text-sm text-muted-foreground">
        این لوگو و نام در هدر، فوتر، منوی موبایل و آیکون اپلیکیشن (هنگام نصب روی گوشی) استفاده
        می‌شود.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="site-title">نام سایت</Label>
          <Input id="site-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="site-logo">لوگو (ترجیحاً مربعی، حداقل ۵۱۲×۵۱۲ پیکسل)</Label>
          <Input id="site-logo" type="file" accept="image/*" onChange={handleLogoChange} />
          {uploading && <p className="mt-1 text-xs text-muted-foreground">در حال آپلود...</p>}
          {uploadError && <p className="mt-1 text-xs text-destructive">{uploadError}</p>}
        </div>
      </div>
      {logo && (
        <div className="mt-4 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="" className="h-14 w-14 rounded-lg border border-border object-cover" />
          <Button type="button" variant="outline" size="sm" onClick={() => setLogo("")}>
            حذف لوگو (بازگشت به پیش‌فرض)
          </Button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {saved && !error && <p className="mt-3 text-sm text-primary">ذخیره شد</p>}
      <Button className="mt-5" type="submit" disabled={loading || uploading}>
        {loading ? "در حال ذخیره..." : "ذخیره"}
      </Button>
    </form>
  );
}
