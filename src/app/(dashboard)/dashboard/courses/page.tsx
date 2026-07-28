import { PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { myCourses } from "@/lib/mock-data";

export default function MyCoursesPage() {
  return (
    <div>
      <PageHeader
        title="دوره‌های من"
        description="دوره‌های خریداری‌شده و پیشرفت یادگیری شما"
      />

      <div className="grid gap-5 md:grid-cols-2">
        {myCourses.map((course) => (
          <div key={course.id} className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="font-bold leading-7">{course.title}</h3>
              {course.progress === 100 ? (
                <Badge variant="success">تکمیل‌شده</Badge>
              ) : (
                <Badge variant="outline">در حال یادگیری</Badge>
              )}
            </div>

            <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>پیشرفت دوره</span>
              <span>{course.progress}٪</span>
            </div>
            <Progress value={course.progress} className="mb-5" />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {course.completedLessons} از {course.lessons} درس تماشا شده
              </span>
              <Button size="sm">
                <PlayCircle size={15} />
                ادامه یادگیری
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
