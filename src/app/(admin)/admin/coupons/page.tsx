import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default async function AdminCouponsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const coupons = await getAdminCoupons();

  return (
    <div>
      <PageHeader
        title="کد تخفیف"
        description="مدیریت کدهای تخفیف و کمپین‌های فروش"
        action={
          <Button size="sm">
            <Plus size={15} />
            ساخت کد تخفیف
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>کد</TableHead>
            <TableHead>درصد تخفیف</TableHead>
            <TableHead>میزان استفاده</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>تاریخ انقضا</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
