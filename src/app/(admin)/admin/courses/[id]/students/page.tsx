import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/auth/session";
import { getAdminCourseEnrollments } from "@/lib/queries/admin";
import { EnrollmentRow } from "@/components/admin/enrollment-row";

export default async function AdminCourseStudentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/admin/inbox");

  const { id } = await params;
  const { course, enrollments } = await getAdminCourseEnrollments(id);
  if (!course) notFound();

  return (
    <div>
      <PageHeader
        title={`دانشجویان پکیج: ${course.title}`}
        description="بررسی خریداران، پیشرفت یادگیری و مدیریت اعتبار دسترسی هر نفر"
      />

      {enrollments.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          هنوز کسی این پکیج را خریداری نکرده است.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>موبایل</TableHead>
              <TableHead>پیشرفت</TableHead>
              <TableHead>تاریخ خرید</TableHead>
              <TableHead>اعتبار دسترسی</TableHead>
              <TableHead>مدیریت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => (
              <EnrollmentRow key={enrollment.id} enrollment={enrollment} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
