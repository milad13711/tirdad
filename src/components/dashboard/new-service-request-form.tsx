"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const typeOptions = [
  { value: "TEASER", label: "تیزر" },
  { value: "IMAGE", label: "طراحی تصویر" },
  { value: "WEBSITE", label: "طراحی سایت" },
];

export function NewServiceRequestForm() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.get("type"),
          description: formData.get("description"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ثبت درخواست");
      setSent(true);
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت درخواست");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rounded-xl border border-border bg-card p-6" onSubmit={handleSubmit}>
      <h3 className="mb-5 font-bold">ثبت درخواست جدید</h3>
      <div className="mb-4">
        <Label htmlFor="service-type">نوع خدمت</Label>
        <select
          id="service-type"
          name="type"
          className="h-11 w-full rounded-md border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
          defaultValue="TEASER"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-5">
        <Label htmlFor="service-description">توضیحات</Label>
        <Textarea
          id="service-description"
          name="description"
          placeholder="کاری که می‌خواید مجید تیرداد براتون انجام بده رو با جزئیات توضیح بدید..."
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        <Send size={15} />
        {loading ? "در حال ارسال..." : "ارسال درخواست"}
      </Button>
      {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}
      {sent && (
        <p className="mt-3 text-center text-sm text-emerald-500">
          درخواست شما با موفقیت ثبت شد.
        </p>
      )}
    </form>
  );
}
