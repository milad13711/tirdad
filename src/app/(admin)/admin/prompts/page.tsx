import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/auth/session";
import { getAdminPrompts } from "@/lib/queries/admin";
import { NewPromptForm } from "@/components/admin/new-prompt-form";
import { PromptRow } from "@/components/admin/prompt-row";

export default async function AdminPromptsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const prompts = await getAdminPrompts();

  return (
    <div>
      <PageHeader
        title="پرامپت‌های رایگان"
        description="مدیریت گالری پرامپت‌های رایگان با عکس قبل/بعد"
      />

      <div className="mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان</TableHead>
              <TableHead>دسته‌بندی</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) => (
              <PromptRow key={prompt.id} prompt={prompt} />
            ))}
          </TableBody>
        </Table>
      </div>

      <NewPromptForm />
    </div>
  );
}
