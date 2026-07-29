"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatJalali } from "@/lib/queries/dashboard";

interface CouponRowProps {
  coupon: {
    id: string;
    code: string;
    discountPercent: number;
    usedCount: number;
    usageLimit: number | null;
    active: boolean;
    expiresAt: Date | null;
  };
}

export function CouponRow({ coupon }: CouponRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: coupon.id,
          discountPercent: formData.get("discountPercent"),
          usageLimit: formData.get("usageLimit") || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره تغییرات");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره تغییرات");
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <TableRow>
        <TableCell colSpan={6}>
          <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2 py-1">
            <span dir="ltr" className="font-mono text-sm">
              {coupon.code}
            </span>
            <Input
              name="discountPercent"
              type="number"
              min={1}
              max={100}
              defaultValue={coupon.discountPercent}
              className="w-24"
              required
            />
            <Input
              name="usageLimit"
              type="number"
              min={1}
              defaultValue={coupon.usageLimit ?? ""}
              placeholder="نامحدود"
              className="w-28"
            />
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "..." : "ذخیره"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
              انصراف
            </Button>
            {error && <p className="w-full text-xs text-destructive">{error}</p>}
          </form>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell dir="ltr" className="text-left font-mono font-medium">
        {coupon.code}
      </TableCell>
      <TableCell>{coupon.discountPercent}٪</TableCell>
      <TableCell className="text-muted-foreground">
        {coupon.usedCount}
        {coupon.usageLimit ? `/${coupon.usageLimit}` : ""}
      </TableCell>
      <TableCell>
        <Badge variant={coupon.active ? "success" : "outline"}>
          {coupon.active ? "فعال" : "غیرفعال"}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {coupon.expiresAt ? formatJalali(coupon.expiresAt) : "بدون انقضا"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ToggleStatusButton
            endpoint="/api/admin/coupons"
            body={{ id: coupon.id, active: !coupon.active }}
            activeNow={coupon.active}
            onLabel="فعال‌سازی"
            offLabel="غیرفعال‌سازی"
          />
          <Button variant="outline" size="icon" aria-label="ویرایش" onClick={() => setEditing(true)}>
            <Pencil size={14} />
          </Button>
          <DeleteButton
            endpoint="/api/admin/coupons"
            id={coupon.id}
            confirmMessage={`کد تخفیف «${coupon.code}» حذف شود؟`}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
