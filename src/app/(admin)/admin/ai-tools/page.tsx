import { EyeOff, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminAiTools } from "@/lib/mock-data";

export default function AdminAiToolsPage() {
  return (
    <div>
      <PageHeader title="ابزارهای هوش مصنوعی" description="مدیریت ابزارهای تولید محتوا با AI" />

      <div className="mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام ابزار</TableHead>
              <TableHead>نوع</TableHead>
              <TableHead>هزینه کردیت</TableHead>
              <TableHead>تعداد اجرا</TableHead>
              <TableHead>وضعیت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminAiTools.map((tool) => (
              <TableRow key={tool.id}>
                <TableCell className="font-medium">{tool.name}</TableCell>
                <TableCell className="text-muted-foreground">{tool.type}</TableCell>
                <TableCell>{tool.credits} کردیت</TableCell>
                <TableCell className="text-muted-foreground">
                  {tool.runs.toLocaleString("fa-IR")}
                </TableCell>
                <TableCell>
                  <Badge variant={tool.status === "فعال" ? "success" : "outline"}>
                    {tool.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Plus size={16} className="text-primary" />
          <h3 className="font-bold">افزودن ابزار جدید</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="tool-name">نام ابزار</Label>
            <Input id="tool-name" placeholder="مثال: بازسازی تصویر محصول" />
          </div>
          <div>
            <Label htmlFor="tool-credits">هزینه کردیت هر اجرا</Label>
            <Input id="tool-credits" type="number" placeholder="۲" />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="tool-prompt" className="flex items-center gap-1.5">
            <EyeOff size={13} />
            پرامپت مخفی (هرگز برای کاربر نمایش داده نمی‌شود)
          </Label>
          <Textarea id="tool-prompt" placeholder="پرامپت اختصاصی پشت این ابزار را وارد کنید..." />
        </div>
        <Button className="mt-5">ذخیره ابزار</Button>
      </div>
    </div>
  );
}
