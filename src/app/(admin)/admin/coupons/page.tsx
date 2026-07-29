import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/auth/session";
import { formatJalali } from "@/lib/queries/dashboard";
import { getAdminCoupons } from "@/lib/queries/admin";
import { NewCouponForm } from "@/components/admin/new-coupon-form";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";

export default async function AdminCouponsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const coupons = await getAdminCoupons();

  return (
    <div>
      <PageHeader title="کد تخفیف" description="مدیریت کدهای تخفیف و کمپین‌های فروش" />

      <div className="mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کد</TableHead>
              <TableHead>درصد تخفیف</TableHead>
              <TableHead>میزان استفاده</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>تاریخ انقضا</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
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
                  <ToggleStatusButton
                    endpoint="/api/admin/coupons"
                    body={{ id: coupon.id, active: !coupon.active }}
                    activeNow={coupon.active}
                    onLabel="فعال‌سازی"
                    offLabel="غیرفعال‌سازی"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <NewCouponForm />
    </div>
  );
}
