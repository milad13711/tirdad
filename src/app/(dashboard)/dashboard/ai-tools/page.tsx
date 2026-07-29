import { redirect } from "next/navigation";
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
import { getSession } from "@/lib/auth/session";
import { getActiveAiTools, getUserGenerations, getUserOverview } from "@/lib/queries/dashboard";
import { formatJalaliDateTime } from "@/lib/format";
import { generationStatusLabel, generationStatusVariant } from "@/lib/status-labels";

const FREE_DAILY_LIMIT = 3;

export default async function AiToolsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [tools, generations, overview] = await Promise.all([
    getActiveAiTools(),
    getUserGenerations(session.sub),
    getUserOverview(session.sub),
  ]);

  const dailyLimit = overview.subscription?.plan.dailyRunLimit ?? FREE_DAILY_LIMIT;
  const remaining = Math.max(0, dailyLimit - overview.dailyRunsUsed);

  return (
    <div>
      <PageHeader
        title="ابزارهای هوش مصنوعی"
        description={`${remaining} اجرای رایگان از ${dailyLimit} مورد امروز باقی مانده است`}
      />

      <div className="mb-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolRunCard
            key={tool.id}
            id={tool.id}
            title={tool.name}
            description="خروجی حرفه‌ای در چند ثانیه، بدون نیاز به تخصص."
            credits={tool.creditCost}
          />
        ))}
      </div>

      <h3 className="mb-4 font-bold">تاریخچه خروجی‌ها</h3>
      {generations.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          هنوز از هیچ ابزاری استفاده نکرده‌اید.
        </div>
      ) : (
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
            {generations.map((gen) => (
              <TableRow key={gen.id}>
                <TableCell className="font-medium">{gen.aiTool.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatJalaliDateTime(gen.createdAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {gen.creditsUsed} کردیت
                </TableCell>
                <TableCell>
                  <Badge variant={generationStatusVariant[gen.status]}>
                    {generationStatusLabel[gen.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
