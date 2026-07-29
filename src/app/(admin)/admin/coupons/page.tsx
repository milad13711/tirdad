import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/auth/session";
import { getAdminCoupons } from "@/lib/queries/admin";
import { NewCouponForm } from "@/components/admin/new-coupon-form";
import { CouponRow } from "@/components/admin/coupon-row";

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
              <CouponRow key={coupon.id} coupon={coupon} />
            ))}
          </TableBody>
        </Table>
      </div>

      <NewCouponForm />
    </div>
  );
}
