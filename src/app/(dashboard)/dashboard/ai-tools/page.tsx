import { PageHeader } from "@/components/dashboard/page-header";
import { ToolRunCard } from "@/components/dashboard/tool-run-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { aiTools } from "@/lib/content";
import { currentUser, myGenerations } from "@/lib/mock-data";

const statusVariant = {
  "تکمیل‌شده": "success",
  "در حال پردازش": "warning",
  "ناموفق": "destructive",
} as const;

export default function AiToolsPage() {
  return (
    <div>
      <PageHeader
        title="ابزارهای هوش مصنوعی"
        description={`${currentUser.dailyRunsLimit - currentUser.dailyRunsUsed} اجرای رایگان از ${currentUser.dailyRunsLimit} مورد امروز باقی مانده است`}
      />

      <div className="mb-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {aiTools.map((tool) => (
          <ToolRunCard key={tool.title} {...tool} />
        ))}
      </div>

      <h3 className="mb-4 font-bold">تاریخچه خروجی‌ها</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ابزار</TableHead>
            <TableHead>تاریخ</TableHead>
            <TableHead>کردیت مصرفی</TableHead>
            <TableHead>وضعیت</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {myGenerations.map((gen) => (
            <TableRow key={gen.id}>
              <TableCell className="font-medium">{gen.tool}</TableCell>
              <TableCell className="text-muted-foreground">{gen.date}</TableCell>
              <TableCell className="text-muted-foreground">{gen.credits} کردیت</TableCell>
              <TableCell>
                <Badge variant={statusVariant[gen.status]}>{gen.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
