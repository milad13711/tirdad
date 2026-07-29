import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getUserOrders } from "@/lib/queries/dashboard";
import { formatJalali, formatToman } from "@/lib/format";
import { orderStatusLabel, orderStatusVariant } from "@/lib/status-labels";

export default async function InvoicesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const orders = await getUserOrders(session.sub);

  return (
    <div>
      <PageHeader title="فاکتورها" description="تاریخچه پرداخت‌ها و خریدهای شما" />

      {orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          هنوز هیچ خریدی ثبت نشده است.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>شماره فاکتور</TableHead>
              <TableHead>شرح</TableHead>
              <TableHead>تاریخ</TableHead>
              <TableHead>مبلغ (تومان)</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  #{order.id.slice(-6).toUpperCase()}
                </TableCell>
                <TableCell className="text-muted-foreground">{order.itemLabel}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatJalali(order.createdAt)}
                </TableCell>
                <TableCell>{formatToman(order.amount)}</TableCell>
                <TableCell>
                  <Badge variant={orderStatusVariant[order.status]}>
                    {orderStatusLabel[order.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <button className="flex cursor-pointer items-center gap-1 text-sm text-primary hover:underline">
                    <Download size={14} />
                    دانلود
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
