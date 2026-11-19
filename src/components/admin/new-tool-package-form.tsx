"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ToolFileUploadField } from "@/components/admin/tool-file-upload-field";
import { VideoUploadField } from "@/components/admin/video-upload-field";

export function NewToolPackageForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverImageError, setCoverImageError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState("");
  const [fileKey, setFileKey] = useState("");
  const [demoVideoUrl, setDemoVideoUrl] = useState("");

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
      setError("لطفاً یک فایل آپلود کنید یا لینک دانلود پکیج را وارد کنید.");
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
          demoVideoUrl: demoVideoUrl || formData.get("demoVideoUrl") || undefined,
          fileUrl: fileKey,
          price: formData.get("price"),
          salePrice: formData.get("salePrice"),
          saleCountdownHours: formData.get("saleCountdownHours"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره پکیج");
      form.reset();
      setCoverImage("");
      setFileKey("");
      setDemoVideoUrl("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره پکیج");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus size={15} />
          افزودن پکیج ابزار
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>افزودن پکیج ابزار جدید</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="tool-title">عنوان پکیج</Label>
              <Input id="tool-title" name="title" placeholder="مثال: پکیج فونت‌های ترند اینستاگرام" required />
            </div>
            <div>
              <Label htmlFor="tool-category">دسته‌بندی</Label>
              <Input id="tool-category" name="category" placeholder="مثال: فونت، افکت کپ‌کات" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="tool-description">توضیحات</Label>
              <Textarea id="tool-description" name="description" placeholder="توضیح کوتاه پکیج..." rows={3} />
            </div>
          </div>

          <fieldset className="rounded-lg border border-border p-4">
            <legend className="px-1 text-xs font-semibold text-muted-foreground">قیمت‌گذاری</legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="tool-price">قیمت (تومان — صفر = رایگان)</Label>
                <Input id="tool-price" name="price" type="number" min={0} defaultValue={0} required />
              </div>
              <div>
                <Label htmlFor="tool-sale-price">قیمت با تخفیف</Label>
                <Input id="tool-sale-price" name="salePrice" type="number" min={0} placeholder="اختیاری" />
              </div>
              <div>
                <Label htmlFor="tool-sale-countdown">تایمر تخفیف (ساعت)</Label>
                <Input
                  id="tool-sale-countdown"
                  name="saleCountdownHours"
                  type="number"
                  min={1}
                  placeholder="خالی = دائمی"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-border p-4">
            <legend className="px-1 text-xs font-semibold text-muted-foreground">فایل قابل دانلود</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">آپلود فایل روی سرور</Label>
                <ToolFileUploadField value={fileKey.startsWith("http") ? "" : fileKey} onChange={setFileKey} />
              </div>
              <div>
                <Label htmlFor="tool-file-url" className="text-xs">
                  یا لینک دانلود خارجی
                </Label>
                <Input
                  id="tool-file-url"
                  dir="ltr"
                  placeholder="https://drive.google.com/..."
                  value={fileKey.startsWith("http") ? fileKey : ""}
                  disabled={Boolean(fileKey) && !fileKey.startsWith("http")}
                  onChange={(event) => setFileKey(event.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-border p-4">
            <legend className="px-1 text-xs font-semibold text-muted-foreground">رسانه</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="tool-cover" className="text-xs">
                  تصویر پکیج (عمودی ۹:۱۶)
                </Label>
                <Input id="tool-cover" type="file" accept="image/*" onChange={handleImageChange} />
                {uploading && <p className="mt-1 text-xs text-muted-foreground">در حال آپلود...</p>}
                {coverImageError && <p className="mt-1 text-xs text-destructive">{coverImageError}</p>}
                {coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt="" className="mt-2 aspect-[9/16] w-20 rounded-lg object-cover" />
                )}
              </div>
              <div>
                <Label className="text-xs">ویدیوی پیش‌نمایش</Label>
                <VideoUploadField value={demoVideoUrl} onChange={setDemoVideoUrl} />
                <Input
                  name="demoVideoUrl"
                  dir="ltr"
                  placeholder="یا لینک یوتیوب..."
                  disabled={Boolean(demoVideoUrl)}
                  className="mt-2"
                />
              </div>
            </div>
          </fieldset>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button type="submit" size="sm" disabled={loading || uploading}>
              {loading ? "در حال ذخیره..." : "ذخیره پکیج"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
