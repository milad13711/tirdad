"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToolFileUploadField } from "@/components/admin/tool-file-upload-field";

export function NewToolPackageForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverImageError, setCoverImageError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState("");
  const [fileKey, setFileKey] = useState("");

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverImageError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "tools");
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
    if (!fileKey) {
      setError("لطفاً ابتدا فایل قابل دانلود پکیج را آپلود کنید.");
      return;
    }
    setLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/admin/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          category: formData.get("category"),
          description: formData.get("description"),
          coverImage: coverImage || undefined,
          fileUrl: fileKey,
          price: formData.get("price"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره پکیج");
      form.reset();
      setCoverImage("");
      setFileKey("");
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
        <h3 className="font-bold">افزودن پکیج ابزار جدید</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Label htmlFor="tool-title">عنوان پکیج</Label>
          <Input id="tool-title" name="title" placeholder="مثال: پکیج فونت‌های ترند اینستاگرام" required />
        </div>
        <div>
          <Label htmlFor="tool-price">قیمت (تومان — صفر = رایگان)</Label>
          <Input id="tool-price" name="price" type="number" min={0} defaultValue={0} required />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Label htmlFor="tool-description">توضیحات</Label>
          <Textarea id="tool-description" name="description" placeholder="توضیح کوتاه پکیج..." />
        </div>
        <div>
          <Label htmlFor="tool-category">دسته‌بندی</Label>
          <Input id="tool-category" name="category" placeholder="مثال: فونت، افکت کپ‌کات" />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>فایل قابل دانلود پکیج</Label>
          <ToolFileUploadField value={fileKey} onChange={setFileKey} />
        </div>
        <div>
          <Label htmlFor="tool-cover">تصویر پکیج</Label>
          <Input id="tool-cover" type="file" accept="image/*" onChange={handleImageChange} />
          {uploading && <p className="mt-1 text-xs text-muted-foreground">در حال آپلود...</p>}
          {coverImageError && <p className="mt-1 text-xs text-destructive">{coverImageError}</p>}
          {coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="mt-2 h-20 w-full rounded-lg object-cover" />
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
