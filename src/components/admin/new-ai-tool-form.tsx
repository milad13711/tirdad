"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { EyeOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const typeOptions = [
  { value: "IMAGE", label: "تصویر" },
  { value: "VIDEO", label: "ویدیو" },
  { value: "AUDIO", label: "صدا" },
];

export function NewAiToolForm() {
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
      const res = await fetch("/api/admin/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          type: formData.get("type"),
          creditCost: formData.get("creditCost"),
          hiddenPrompt: formData.get("hiddenPrompt"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره ابزار");
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره ابزار");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rounded-xl border border-border bg-card p-6" onSubmit={handleSubmit}>
      <div className="mb-5 flex items-center gap-2">
        <Plus size={16} className="text-primary" />
        <h3 className="font-bold">افزودن ابزار جدید</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="tool-name">نام ابزار</Label>
          <Input id="tool-name" name="name" placeholder="مثال: بازسازی تصویر محصول" required />
        </div>
        <div>
          <Label htmlFor="tool-type">نوع ابزار</Label>
          <select
            id="tool-type"
            name="type"
            className="h-11 w-full rounded-md border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
            defaultValue="IMAGE"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="tool-credits">هزینه کردیت هر اجرا</Label>
          <Input id="tool-credits" name="creditCost" type="number" min={1} placeholder="۲" required />
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="tool-prompt" className="flex items-center gap-1.5">
          <EyeOff size={13} />
          پرامپت مخفی (هرگز برای کاربر نمایش داده نمی‌شود)
        </Label>
        <Textarea
          id="tool-prompt"
          name="hiddenPrompt"
          placeholder="پرامپت اختصاصی پشت این ابزار را وارد کنید..."
          required
        />
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <Button className="mt-5" type="submit" disabled={loading}>
        {loading ? "در حال ذخیره..." : "ذخیره ابزار"}
      </Button>
    </form>
  );
}
