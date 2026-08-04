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
import { getAdminTeaserSamples } from "@/lib/queries/admin";
import { NewTeaserForm } from "@/components/admin/new-teaser-form";
import { TeaserRow } from "@/components/admin/teaser-row";

export default async function AdminTeasersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const samples = await getAdminTeaserSamples();

  return (
    <div>
      <PageHeader
        title="نمونه‌کارهای تیزر"
        description="نمونه‌های تیزر تولیدشده که در بخش «تولید محتوا» صفحه اصلی نمایش داده می‌شوند"
      />

      <div className="mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>تاریخ</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {samples.map((sample) => (
              <TeaserRow key={sample.id} sample={sample} />
            ))}
          </TableBody>
        </Table>
      </div>

      <NewTeaserForm />
    </div>
  );
}
