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
import { adminCourses } from "@/lib/mock-data";

export default function AdminCoursesPage() {
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
          {adminCourses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium">{course.title}</TableCell>
              <TableCell>{course.price}</TableCell>
              <TableCell className="text-muted-foreground">{course.students}</TableCell>
              <TableCell>
                <Badge variant={course.status === "منتشرشده" ? "success" : "outline"}>
                  {course.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
