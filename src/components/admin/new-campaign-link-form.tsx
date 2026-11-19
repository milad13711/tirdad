"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Link2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewCampaignLinkForm({
  courses,
  toolPackages,
}: {
  courses: { id: string; title: string }[];
  toolPackages: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"COURSE" | "TOOL_PACKAGE">("COURSE");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id: formData.get("productId"), label: formData.get("label") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ساخت لینک");
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ساخت لینک");
    } finally {
      setLoading(false);
    }
  }

  const options = type === "COURSE" ? courses : toolPackages;

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Link2 size={16} className="text-primary" />
        <h3 className="font-bold">ساخت لینک کمپین جدید</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="campaign-type">نوع محصول</Label>
          <select
            id="campaign-type"
            value={type}
            onChange={(e) => setType(e.target.value as "COURSE" | "TOOL_PACKAGE")}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="COURSE">پکیج آموزشی</option>
            <option value="TOOL_PACKAGE">پکیج ابزار</option>
          </select>
        </div>
        <div>
          <Label htmlFor="campaign-product">محصول</Label>
          <select
            id="campaign-product"
            name="productId"
            required
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="campaign-label">عنوان کمپین (اختیاری)</Label>
          <Input id="campaign-label" name="label" placeholder="مثال: استوری اینستاگرام" />
        </div>
      </div>
      <Button type="submit" size="sm" disabled={loading} className="mt-4">
        <Plus size={14} />
        {loading ? "در حال ساخت..." : "ساخت لینک"}
      </Button>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </form>
  );
}
