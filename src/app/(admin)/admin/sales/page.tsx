import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/auth/session";
import { isFullAdmin } from "@/lib/auth/roles";
import { formatJalali } from "@/lib/format";
import { getAdminUsers, getAdminCoupons } from "@/lib/queries/admin";
import { NewCouponForm } from "@/components/admin/new-coupon-form";
import { CouponRow } from "@/components/admin/coupon-row";

export default async function AdminSalesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFullAdmin(session)) redirect("/admin/inbox");

  const [users, coupons] = await Promise.all([getAdminUsers(), getAdminCoupons()]);

  return (
    <div>
      <PageHeader title="کاربران و تخفیف‌ها" description="مدیریت مشتریان و کدهای تخفیف" />

      <AdminTabs
        tabs={[
          {
            key: "users",
            label: "کاربران",
            content: (
              <div>
                <div className="mb-4 flex justify-end">
                  <Input placeholder="جستجوی کاربر..." className="w-full sm:w-64" />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام کاربر</TableHead>
                      <TableHead>شماره موبایل</TableHead>
                      <TableHead>پلن</TableHead>
                      <TableHead>تاریخ عضویت</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name ?? "—"}</TableCell>
                        <TableCell dir="ltr" className="text-left text-muted-foreground">
                          {user.phone}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.subscriptions[0]?.plan.name ?? "رایگان"}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatJalali(user.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ),
          },
          {
            key: "coupons",
            label: "کد تخفیف",
            content: (
              <>
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
                <NewCouponForm />
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
