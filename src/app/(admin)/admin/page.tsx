import { redirect } from "next/navigation";
import { BadgeDollarSign, MessagesSquare, Users, Zap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
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
import { formatJalali, formatToman } from "@/lib/queries/dashboard";
import { getAdminOrders, getAdminStats } from "@/lib/queries/admin";
import { orderStatusLabel, orderStatusVariant } from "@/lib/status-labels";

export default async function AdminOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [stats, orders] = await Promise.all([getAdminStats(), getAdminOrders()]);

  const statCards = [
    { label: "درآمد این ماه", value: `${formatToman(stats.monthlyRevenue)} تومان`, icon: BadgeDollarSign },
    { label: "کاربران فعال", value: formatToman(stats.activeUsers), icon: Users },
    { label: "اجرای ابزار AI", value: formatToman(stats.aiRuns), icon: Zap },
    { label: "لیدهای جدید", value: formatToman(stats.newLeads), icon: MessagesSquare },
  ];

  return (
    <div>
      <PageHeader title="نمای کلی" description="عملکرد کلی پلتفرم در یک نگاه" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-5 font-bold">آخرین سفارش‌ها</h3>
        {orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">هنوز سفارشی ثبت نشده است.</p>
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
        )}
      </div>
    </div>
  );
}
