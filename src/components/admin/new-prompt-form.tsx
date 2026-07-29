"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const typeOptions = [
  { value: "IMAGE", label: "تصویر" },
  { value: "VIDEO", label: "ویدیو" },
  { value: "AUDIO", label: "صدا" },
];

export function NewPromptForm() {
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
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          type: formData.get("type"),
          promptText: formData.get("promptText"),
          demoBeforeUrl: formData.get("demoBeforeUrl") || undefined,
          demoAfterUrl: formData.get("demoAfterUrl") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره پرامپت");
      form.reset();
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
            defaultValue="IMAGE"
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
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="prompt-before">لینک عکس قبل (اختیاری)</Label>
          <Input id="prompt-before" name="demoBeforeUrl" dir="ltr" placeholder="https://..." />
        </div>
        <div>
          <Label htmlFor="prompt-after">لینک عکس بعد (اختیاری)</Label>
          <Input id="prompt-after" name="demoAfterUrl" dir="ltr" placeholder="https://..." />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <Button className="mt-5" type="submit" disabled={loading}>
        {loading ? "در حال ذخیره..." : "ذخیره پرامپت"}
      </Button>
    </form>
  );
}
