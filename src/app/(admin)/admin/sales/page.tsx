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
import { formatJalali, formatToman } from "@/lib/format";
import { getAdminUsers, getAdminOrders, getAdminCoupons } from "@/lib/queries/admin";
import { orderStatusLabel, orderStatusVariant } from "@/lib/status-labels";
import { NewCouponForm } from "@/components/admin/new-coupon-form";
import { CouponRow } from "@/components/admin/coupon-row";

export default async function AdminSalesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [users, orders, coupons] = await Promise.all([
    getAdminUsers(),
    getAdminOrders(),
    getAdminCoupons(),
  ]);

  return (
    <div>
      <PageHeader title="فروش و کاربران" description="مدیریت کاربران، سفارش‌ها و کدهای تخفیف" />

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
                      <TableHead>نقش</TableHead>
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
                        <TableCell>
                          <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                            {user.role === "ADMIN" ? "مدیر" : "کاربر"}
                          </Badge>
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
            key: "orders",
            label: "سفارش‌ها",
            content:
              orders.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                  هنوز سفارشی ثبت نشده است.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>شماره سفارش</TableHead>
                      <TableHead>کاربر</TableHead>
                      <TableHead>مورد</TableHead>
                      <TableHead>مبلغ (تومان)</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>تاریخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id.slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell>{order.user.name ?? order.user.phone}</TableCell>
                        <TableCell className="text-muted-foreground">{order.itemLabel}</TableCell>
                        <TableCell>{formatToman(order.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={orderStatusVariant[order.status]}>
                            {orderStatusLabel[order.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatJalali(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
