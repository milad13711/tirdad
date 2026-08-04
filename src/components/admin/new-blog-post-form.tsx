"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SeoChecklist } from "@/components/admin/seo-checklist";

export function NewBlogPostForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverImageError, setCoverImageError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverImageError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در آپلود تصویر");
      setCoverImage(data.url);
    } catch (err) {
      // Shown right under the field — a generic banner near the submit
      // button, several fields down, is too easy to miss and leaves a
      // failed upload looking identical to "saved with no image".
      setCoverImageError(err instanceof Error ? err.message : "خطا در آپلود تصویر");
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, content, coverImage, metaTitle, metaDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره مقاله");
      setTitle("");
      setExcerpt("");
      setContent("");
      setMetaTitle("");
      setMetaDescription("");
      setCoverImage("");
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

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div>
            <Label htmlFor="post-title">عنوان مقاله</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ۵ ترفند رشد اینستاگرام"
              required
            />
          </div>
          <div>
            <Label htmlFor="post-cover">تصویر شاخص</Label>
            <Input id="post-cover" type="file" accept="image/*" onChange={handleImageChange} />
            {uploading && <p className="mt-1 text-xs text-muted-foreground">در حال آپلود...</p>}
            {coverImageError && <p className="mt-1 text-xs text-destructive">{coverImageError}</p>}
            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImage}
                alt="پیش‌نمایش تصویر شاخص"
                className="mt-2 h-32 w-full rounded-lg object-cover"
              />
            )}
          </div>
          <div>
            <Label htmlFor="post-excerpt">خلاصه</Label>
            <Input
              id="post-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="یک خط توضیح برای لیست مقالات"
            />
          </div>
          <div>
            <Label htmlFor="post-content">متن مقاله</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="متن کامل مقاله را وارد کنید..."
              rows={8}
            />
          </div>
          <div>
            <Label htmlFor="post-meta-title">عنوان سئو (Meta Title)</Label>
            <Input
              id="post-meta-title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="اگر خالی بماند از عنوان مقاله استفاده می‌شود"
            />
          </div>
          <div>
            <Label htmlFor="post-meta-description">توضیحات سئو (Meta Description)</Label>
            <Textarea
              id="post-meta-description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="توضیحی که در نتایج گوگل نمایش داده می‌شود"
              rows={2}
            />
          </div>
        </div>

        <SeoChecklist
          title={title}
          metaTitle={metaTitle}
          metaDescription={metaDescription}
          excerpt={excerpt}
          content={content}
          hasCoverImage={!!coverImage}
        />
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <Button className="mt-5" type="submit" disabled={loading || uploading}>
        {loading ? "در حال ذخیره..." : "ذخیره مقاله (پیش‌نویس)"}
      </Button>
    </form>
  );
}
