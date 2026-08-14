import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSession } from "@/lib/auth/session";
import { isStaffOrAdmin } from "@/lib/auth/roles";
import { formatJalali, formatToman } from "@/lib/format";
import { getAdminOrders } from "@/lib/queries/admin";
import { orderStatusLabel, orderStatusVariant } from "@/lib/status-labels";

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaffOrAdmin(session)) redirect("/dashboard");

  const orders = await getAdminOrders(100);

  return (
    <div>
      <PageHeader title="سفارش‌ها" description="آخرین سفارش‌های ثبت‌شده در پلتفرم" />
      {orders.length === 0 ? (
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
                <TableCell className="font-medium">#{order.id.slice(-6).toUpperCase()}</TableCell>
                <TableCell>{order.user.name ?? order.user.phone}</TableCell>
                <TableCell className="text-muted-foreground">{order.itemLabel}</TableCell>
                <TableCell>{formatToman(order.amount)}</TableCell>
                <TableCell>
                  <Badge variant={orderStatusVariant[order.status]}>{orderStatusLabel[order.status]}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatJalali(order.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
