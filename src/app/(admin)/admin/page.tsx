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
import { adminOrders, adminStats } from "@/lib/mock-data";

const icons = [BadgeDollarSign, Users, Zap, MessagesSquare];

const statusVariant = {
  موفق: "success",
  "در انتظار": "warning",
  ناموفق: "destructive",
} as const;

export default function AdminOverviewPage() {
  return (
    <div>
      <PageHeader title="نمای کلی" description="عملکرد کلی پلتفرم در یک نگاه" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} icon={icons[index]} />
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-5 font-bold">آخرین سفارش‌ها</h3>
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
            {adminOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.user}</TableCell>
                <TableCell className="text-muted-foreground">{order.item}</TableCell>
                <TableCell>{order.amount}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{order.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
