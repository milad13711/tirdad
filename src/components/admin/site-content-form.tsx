"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteContent } from "@/lib/site-content";

const FIELDS: { key: keyof SiteContent; label: string; multiline?: boolean }[] = [
  { key: "heroTitle", label: "عنوان اصلی (بخش اول)" },
  { key: "heroTitleHighlight", label: "عنوان اصلی (بخش رنگی)" },
  { key: "heroSubtitle", label: "توضیح زیر عنوان اصلی", multiline: true },
  { key: "instagramTitle", label: "عنوان بخش CRM اینستاگرام (هر خط با Enter جدا شود)", multiline: true },
  { key: "instagramDescription", label: "توضیح بخش CRM اینستاگرام", multiline: true },
];

export function SiteContentForm({ content }: { content: SiteContent }) {
  const router = useRouter();
  const [values, setValues] = useState(content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره محتوا");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره محتوا");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-1 font-bold">محتوای صفحه اصلی</h3>
      <p className="mb-5 text-sm text-muted-foreground">
        این متن‌ها مستقیم روی لندینگ نمایش داده می‌شن — بدون نیاز به دیپلوی جدید.
      </p>
      <div className="space-y-4">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.multiline ? (
              <Textarea
                id={field.key}
                value={values[field.key]}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                rows={3}
              />
            ) : (
              <Input
                id={field.key}
                value={values[field.key]}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {saved && !error && <p className="mt-3 text-sm text-primary">ذخیره شد</p>}
      <Button className="mt-5" type="submit" disabled={loading}>
        {loading ? "در حال ذخیره..." : "ذخیره محتوا"}
      </Button>
    </form>
  );
}
