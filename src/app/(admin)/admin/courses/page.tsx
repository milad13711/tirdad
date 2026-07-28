import { redirect } from "next/navigation";
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
import { getSession } from "@/lib/auth/session";
import { formatToman } from "@/lib/queries/dashboard";
import { getAdminCourses } from "@/lib/queries/admin";

export default async function AdminCoursesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const courses = await getAdminCourses();

  return (
    <div>
      <PageHeader
        title="دوره‌ها"
        description="مدیریت دوره‌های آموزشی پلتفرم"
        action={
          <Button size="sm">
            <Plus size={15} />
            افزودن دوره جدید
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>عنوان دوره</TableHead>
            <TableHead>قیمت (تومان)</TableHead>
            <TableHead>دانشجویان</TableHead>
            <TableHead>وضعیت</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium">{course.title}</TableCell>
              <TableCell>{formatToman(course.price)}</TableCell>
              <TableCell className="text-muted-foreground">
                {course._count.enrollments}
              </TableCell>
              <TableCell>
                <Badge variant={course.published ? "success" : "outline"}>
                  {course.published ? "منتشرشده" : "پیش‌نویس"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
