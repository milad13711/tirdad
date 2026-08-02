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
import { getAdminCourseWithLessons } from "@/lib/queries/admin";
import { NewLessonForm } from "@/components/admin/new-lesson-form";
import { LessonRow } from "@/components/admin/lesson-row";

export default async function AdminCourseLessonsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const course = await getAdminCourseWithLessons(id);
  if (!course) notFound();

  return (
    <div>
      <PageHeader title={`دروس پکیج: ${course.title}`} description="مدیریت جلسات و ویدیوهای پکیج" />

      <div className="mb-8">
        {course.lessons.length === 0 ? (
          <div className="mb-8 rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            هنوز درسی برای این پکیج ثبت نشده است.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ترتیب</TableHead>
                <TableHead>عنوان درس</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {course.lessons.map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <NewLessonForm courseId={course.id} />
    </div>
  );
}
