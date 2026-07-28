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
import { adminOrders } from "@/lib/mock-data";

const statusVariant = {
  موفق: "success",
  "در انتظار": "warning",
  ناموفق: "destructive",
} as const;

export default function AdminOrdersPage() {
  return (
    <div>
      <PageHeader title="سفارش‌ها" description="مدیریت سفارش‌ها و تراکنش‌های پلتفرم" />

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
  );
}
