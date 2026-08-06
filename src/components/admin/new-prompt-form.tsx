"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BusinessCategoryPicker } from "@/components/admin/business-category-picker";

const typeOptions = [
  { value: "IMAGE", label: "تصویر" },
  { value: "VIDEO", label: "ویدیو" },
  { value: "AUDIO", label: "صدا" },
];

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "prompts");
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "خطا در آپلود تصویر");
  return data.url as string;
}

export function NewPromptForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"IMAGE" | "VIDEO" | "AUDIO">("IMAGE");
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [demoBeforeUrl, setDemoBeforeUrl] = useState("");
  const [demoAfterUrl, setDemoAfterUrl] = useState("");
  const [beforeError, setBeforeError] = useState<string | null>(null);
  const [afterError, setAfterError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void,
    setFieldError: (msg: string | null) => void,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFieldError(null);
    setUploading(true);
    try {
      setUrl(await uploadImage(file));
    } catch (err) {
      // Shown directly under the field that failed — a generic error
      // banner near the submit button is too easy to miss, and a failed
      // upload (e.g. an iPhone HEIC photo, which isn't in the allowed
      // list) otherwise looks identical to "saved with no image".
      setFieldError(err instanceof Error ? err.message : "خطا در آپلود تصویر");
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
    const price = isPremium ? Number(formData.get("price") ?? 0) : 0;

    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          type: formData.get("type"),
          promptText: formData.get("promptText"),
          usageInstructions: formData.get("usageInstructions") || undefined,
          price,
          demoBeforeUrl: demoBeforeUrl || undefined,
          demoAfterUrl: demoAfterUrl || undefined,
          tags: categories,
          featured: formData.get("featured") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره پرامپت");
      form.reset();
      setDemoBeforeUrl("");
      setDemoAfterUrl("");
      setCategories([]);
      setIsPremium(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره پرامپت");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rounded-xl border border-border bg-card p-6" onSubmit={handleSubmit}>
      <div className="mb-5 flex items-center gap-2">
        <Plus size={16} className="text-primary" />
        <h3 className="font-bold">افزودن پرامپت جدید</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="prompt-name">عنوان</Label>
          <Input id="prompt-name" name="name" placeholder="مثال: بازسازی تصویر محصول" required />
        </div>
        <div>
          <Label htmlFor="prompt-type">دسته‌بندی</Label>
          <select
            id="prompt-type"
            name="type"
            className="h-11 w-full rounded-md border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
            value={type}
            onChange={(e) => {
              setType(e.target.value as "IMAGE" | "VIDEO" | "AUDIO");
              setDemoAfterUrl("");
              setAfterError(null);
            }}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="prompt-text">متن پرامپت (کاربر می‌تواند آن را کپی کند)</Label>
        <Textarea
          id="prompt-text"
          name="promptText"
          placeholder="متن کامل پرامپت را وارد کنید..."
          required
        />
      </div>
      <div className="mt-4">
        <Label htmlFor="prompt-usage">توضیحات آموزشی نحوه استفاده (بعد از باز شدن پرامپت نمایش داده می‌شود)</Label>
        <Textarea
          id="prompt-usage"
          name="usageInstructions"
          placeholder="مثلاً: این پرامپت را در ابزار X بچسبانید و عکس محصول را آپلود کنید..."
          rows={3}
        />
      </div>
      <div className="mt-4">
        <Label>دسته‌بندی کسب‌وکار</Label>
        <BusinessCategoryPicker selected={categories} onChange={setCategories} />
      </div>
      <div className="mt-4 rounded-lg border border-border p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          پریمیوم (پولی)
        </label>
        {isPremium && (
          <div className="mt-3 max-w-40">
            <Label htmlFor="prompt-price">قیمت (تومان)</Label>
            <Input id="prompt-price" name="price" type="number" min={1000} step={1000} placeholder="۵۰۰۰۰" required />
          </div>
        )}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="prompt-before">{type === "IMAGE" ? "عکس قبل" : "عکس (کاور)"}</Label>
          <Input
            id="prompt-before"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, setDemoBeforeUrl, setUploadingBefore, setBeforeError)}
          />
          {uploadingBefore && <p className="mt-1 text-xs text-muted-foreground">در حال آپلود...</p>}
          {beforeError && <p className="mt-1 text-xs text-destructive">{beforeError}</p>}
          {demoBeforeUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={demoBeforeUrl} alt="" className="mt-2 h-24 w-full rounded-lg object-cover" />
          )}
        </div>
        {type === "IMAGE" ? (
          <div>
            <Label htmlFor="prompt-after">عکس بعد</Label>
            <Input
              id="prompt-after"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setDemoAfterUrl, setUploadingAfter, setAfterError)}
            />
            {uploadingAfter && <p className="mt-1 text-xs text-muted-foreground">در حال آپلود...</p>}
            {afterError && <p className="mt-1 text-xs text-destructive">{afterError}</p>}
            {demoAfterUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={demoAfterUrl} alt="" className="mt-2 h-24 w-full rounded-lg object-cover" />
            )}
          </div>
        ) : (
          <div>
            <Label htmlFor="prompt-after">{type === "VIDEO" ? "لینک ویدئوی دمو" : "لینک صوت دمو"}</Label>
            <Input
              id="prompt-after"
              type="url"
              dir="ltr"
              placeholder="https://..."
              value={demoAfterUrl}
              onChange={(e) => setDemoAfterUrl(e.target.value)}
            />
          </div>
        )}
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="featured" className="h-4 w-4 rounded border-border" />
        نمایش در ۳ پرامپت ویژه صفحه اصلی
      </label>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <Button className="mt-5" type="submit" disabled={loading || uploadingBefore || uploadingAfter}>
        {loading ? "در حال ذخیره..." : "ذخیره پرامپت"}
      </Button>
    </form>
  );
}
