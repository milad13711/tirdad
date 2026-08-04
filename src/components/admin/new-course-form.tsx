"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewCourseForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverImageError, setCoverImageError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState("");

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverImageError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "courses");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در آپلود تصویر");
      setCoverImage(data.url);
    } catch (err) {
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
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          durationLabel: formData.get("durationLabel"),
          coverImage: coverImage || undefined,
          price: formData.get("price"),
          level: formData.get("level"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره پکیج");
      form.reset();
      setCoverImage("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره پکیج");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rounded-xl border border-border bg-card p-6" onSubmit={handleSubmit}>
      <div className="mb-5 flex items-center gap-2">
        <Plus size={16} className="text-primary" />
        <h3 className="font-bold">افزودن پکیج آموزشی جدید</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Label htmlFor="course-title">عنوان پکیج</Label>
          <Input id="course-title" name="title" placeholder="مثال: پکیج تدوین ویدیو" required />
        </div>
        <div>
          <Label htmlFor="course-price">قیمت (تومان)</Label>
          <Input id="course-price" name="price" type="number" min={0} placeholder="۱۹۹۰۰۰۰" required />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Label htmlFor="course-description">توضیحات</Label>
          <Textarea id="course-description" name="description" placeholder="توضیح کوتاه پکیج..." />
        </div>
        <div>
          <Label htmlFor="course-level">سطح</Label>
          <Input id="course-level" name="level" placeholder="مثال: مقدماتی" />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="course-duration">مدت زمان آموزش</Label>
          <Input id="course-duration" name="durationLabel" placeholder="مثال: ۱۸ ساعت" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="course-cover">تصویر پکیج</Label>
          <Input id="course-cover" type="file" accept="image/*" onChange={handleImageChange} />
          {uploading && <p className="mt-1 text-xs text-muted-foreground">در حال آپلود...</p>}
          {coverImageError && <p className="mt-1 text-xs text-destructive">{coverImageError}</p>}
          {coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="mt-2 h-24 w-full rounded-lg object-cover" />
          )}
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <Button className="mt-5" type="submit" disabled={loading || uploading}>
        {loading ? "در حال ذخیره..." : "ذخیره پکیج"}
      </Button>
    </form>
  );
}
