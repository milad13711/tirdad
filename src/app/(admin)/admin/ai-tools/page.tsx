import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { NewAiToolForm } from "@/components/admin/new-ai-tool-form";
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
import { getAdminAiTools } from "@/lib/queries/admin";
import { aiToolTypeLabel } from "@/lib/status-labels";

export default async function AdminAiToolsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tools = await getAdminAiTools();

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
            {tools.map((tool) => (
              <TableRow key={tool.id}>
                <TableCell className="font-medium">{tool.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {aiToolTypeLabel[tool.type]}
                </TableCell>
                <TableCell>{tool.creditCost} کردیت</TableCell>
                <TableCell className="text-muted-foreground">
                  {tool._count.generations.toLocaleString("fa-IR")}
                </TableCell>
                <TableCell>
                  <Badge variant={tool.active ? "success" : "outline"}>
                    {tool.active ? "فعال" : "غیرفعال"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <NewAiToolForm />
    </div>
  );
}
