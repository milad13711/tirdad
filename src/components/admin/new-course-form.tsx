"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewCourseForm() {
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
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          price: formData.get("price"),
          level: formData.get("level"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره پکیج");
      form.reset();
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
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <Button className="mt-5" type="submit" disabled={loading}>
        {loading ? "در حال ذخیره..." : "ذخیره پکیج"}
      </Button>
    </form>
  );
}
