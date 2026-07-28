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
import { adminCoupons } from "@/lib/mock-data";

export default function AdminCouponsPage() {
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
          {adminCoupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell dir="ltr" className="text-left font-mono font-medium">
                {coupon.code}
              </TableCell>
              <TableCell>{coupon.discount}</TableCell>
              <TableCell className="text-muted-foreground">{coupon.usage}</TableCell>
              <TableCell>
                <Badge variant={coupon.status === "فعال" ? "success" : "outline"}>
                  {coupon.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{coupon.expiresAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
