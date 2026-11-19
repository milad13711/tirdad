"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function NewCourseForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
          salePrice: formData.get("salePrice"),
          saleCountdownHours: formData.get("saleCountdownHours"),
          level: formData.get("level"),
          accessDurationDays: formData.get("accessDurationDays"),
          displayEnrollmentOffset: formData.get("displayEnrollmentOffset") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره پکیج");
      form.reset();
      setCoverImage("");
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
          افزودن پکیج آموزشی
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>افزودن پکیج آموزشی جدید</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="course-title">عنوان پکیج</Label>
              <Input id="course-title" name="title" placeholder="مثال: پکیج تدوین ویدیو" required />
            </div>
            <div>
              <Label htmlFor="course-level">سطح</Label>
              <Input id="course-level" name="level" placeholder="مثال: مقدماتی" />
            </div>
            <div>
              <Label htmlFor="course-duration">مدت زمان آموزش</Label>
              <Input id="course-duration" name="durationLabel" placeholder="مثال: ۱۸ ساعت" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="course-description">توضیحات</Label>
              <Textarea id="course-description" name="description" placeholder="توضیح کامل پکیج..." rows={3} />
            </div>
          </div>

          <fieldset className="rounded-lg border border-border p-4">
            <legend className="px-1 text-xs font-semibold text-muted-foreground">قیمت‌گذاری</legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="course-price">قیمت (تومان)</Label>
                <Input id="course-price" name="price" type="number" min={0} placeholder="۱۹۹۰۰۰۰" required />
              </div>
              <div>
                <Label htmlFor="course-sale-price">قیمت با تخفیف</Label>
                <Input id="course-sale-price" name="salePrice" type="number" min={0} placeholder="اختیاری" />
              </div>
              <div>
                <Label htmlFor="course-sale-countdown">تایمر تخفیف (ساعت)</Label>
                <Input
                  id="course-sale-countdown"
                  name="saleCountdownHours"
                  type="number"
                  min={1}
                  placeholder="خالی = دائمی"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-border p-4">
            <legend className="px-1 text-xs font-semibold text-muted-foreground">دسترسی و دانشجویان</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="course-access-duration">مدت اعتبار دسترسی (روز)</Label>
                <Input
                  id="course-access-duration"
                  name="accessDurationDays"
                  type="number"
                  min={1}
                  placeholder="خالی = نامحدود"
                />
              </div>
              <div>
                <Label htmlFor="course-enrollment-offset">تعداد دانشجوی اولیه (خارج از سایت)</Label>
                <Input id="course-enrollment-offset" name="displayEnrollmentOffset" type="number" min={0} placeholder="مثال: ۵۰" />
              </div>
            </div>
          </fieldset>

          <div>
            <Label htmlFor="course-cover">تصویر پکیج</Label>
            <Input id="course-cover" type="file" accept="image/*" onChange={handleImageChange} />
            {uploading && <p className="mt-1 text-xs text-muted-foreground">در حال آپلود...</p>}
            {coverImageError && <p className="mt-1 text-xs text-destructive">{coverImageError}</p>}
            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt="" className="mt-2 h-24 w-full rounded-lg object-cover" />
            )}
          </div>

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
