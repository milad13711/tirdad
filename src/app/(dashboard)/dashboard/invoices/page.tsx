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
import { myInvoices } from "@/lib/mock-data";

const statusVariant = {
  "پرداخت‌شده": "success",
  "بازپرداخت‌شده": "outline",
} as const;

export default function InvoicesPage() {
  return (
    <div>
      <PageHeader title="فاکتورها" description="تاریخچه پرداخت‌ها و خریدهای شما" />

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
          {myInvoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell className="text-muted-foreground">{invoice.item}</TableCell>
              <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
              <TableCell>{invoice.amount}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[invoice.status]}>{invoice.status}</Badge>
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
    </div>
  );
}
