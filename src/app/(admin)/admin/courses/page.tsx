import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/page-header";
import { getSession } from "@/lib/auth/session";
import { getAdminCourses } from "@/lib/queries/admin";
import { NewCourseForm } from "@/components/admin/new-course-form";
import { CourseRow } from "@/components/admin/course-row";

export default async function AdminCoursesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const courses = await getAdminCourses();

  return (
    <div>
      <PageHeader title="دوره‌ها" description="مدیریت دوره‌های آموزشی پلتفرم" />

      <div className="mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان دوره</TableHead>
              <TableHead>قیمت (تومان)</TableHead>
              <TableHead>دانشجویان</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <CourseRow key={course.id} course={course} />
            ))}
          </TableBody>
        </Table>
      </div>

      <NewCourseForm />
    </div>
  );
}
