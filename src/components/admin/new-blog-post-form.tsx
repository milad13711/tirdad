"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewBlogPostForm() {
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
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          excerpt: formData.get("excerpt"),
          content: formData.get("content"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره مقاله");
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره مقاله");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rounded-xl border border-border bg-card p-6" onSubmit={handleSubmit}>
      <div className="mb-5 flex items-center gap-2">
        <Plus size={16} className="text-primary" />
        <h3 className="font-bold">نوشتن مقاله جدید</h3>
      </div>
      <div>
        <Label htmlFor="post-title">عنوان مقاله</Label>
        <Input id="post-title" name="title" placeholder="مثال: ۵ ترفند رشد اینستاگرام" required />
      </div>
      <div className="mt-4">
        <Label htmlFor="post-excerpt">خلاصه</Label>
        <Input id="post-excerpt" name="excerpt" placeholder="یک خط توضیح برای لیست مقالات" />
      </div>
      <div className="mt-4">
        <Label htmlFor="post-content">متن مقاله</Label>
        <Textarea id="post-content" name="content" placeholder="متن کامل مقاله را وارد کنید..." />
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <Button className="mt-5" type="submit" disabled={loading}>
        {loading ? "در حال ذخیره..." : "ذخیره مقاله (پیش‌نویس)"}
      </Button>
    </form>
  );
}
