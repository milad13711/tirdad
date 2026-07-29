"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { leadSourceLabel } from "@/lib/status-labels";

const sourceOptions = Object.entries(leadSourceLabel) as [keyof typeof leadSourceLabel, string][];

export function NewLeadForm() {
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
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone") || undefined,
          source: formData.get("source"),
          topic: formData.get("topic") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ثبت لید");
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت لید");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="mt-6 rounded-xl border border-border bg-card p-6"
      onSubmit={handleSubmit}
    >
      <div className="mb-5 flex items-center gap-2">
        <Plus size={16} className="text-primary" />
        <h3 className="font-bold">ثبت لید جدید</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <Label htmlFor="lead-name">نام</Label>
          <Input id="lead-name" name="name" placeholder="نام مخاطب" required />
        </div>
        <div>
          <Label htmlFor="lead-phone">شماره تماس (اختیاری)</Label>
          <Input id="lead-phone" name="phone" dir="ltr" placeholder="09xxxxxxxxx" />
        </div>
        <div>
          <Label htmlFor="lead-source">منبع</Label>
          <select
            id="lead-source"
            name="source"
            className="h-11 w-full rounded-md border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
            defaultValue="DIRECT"
          >
            {sourceOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="lead-topic">موضوع (اختیاری)</Label>
          <Input id="lead-topic" name="topic" placeholder="مثال: سوال درباره دوره" />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <Button className="mt-5" type="submit" disabled={loading}>
        {loading ? "در حال ثبت..." : "ثبت لید"}
      </Button>
    </form>
  );
}
