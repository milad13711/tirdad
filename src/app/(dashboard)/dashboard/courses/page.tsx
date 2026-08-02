import { PlayCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getUserEnrollments } from "@/lib/queries/dashboard";

export default async function MyCoursesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const enrollments = await getUserEnrollments(session.sub);

  return (
    <div>
      <PageHeader
        title="پکیج‌های آموزشی من"
        description="پکیج‌های خریداری‌شده و پیشرفت یادگیری شما"
        action={
          <Button asChild size="sm">
            <Link href="/dashboard/courses/browse">
              <ShoppingBag size={15} />
              خرید پکیج جدید
            </Link>
          </Button>
        }
      />

      {enrollments.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {enrollments.map((enrollment) => {
            const totalLessons = enrollment.course.lessons.length;
            const completedLessons = Math.round((enrollment.progress / 100) * totalLessons);
            return (
              <div
                key={enrollment.id}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h3 className="font-bold leading-7">{enrollment.course.title}</h3>
                  {enrollment.progress === 100 ? (
                    <Badge variant="success">تکمیل‌شده</Badge>
                  ) : (
                    <Badge variant="outline">در حال یادگیری</Badge>
                  )}
                </div>

                <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>پیشرفت دوره</span>
                  <span>{enrollment.progress}٪</span>
                </div>
                <Progress value={enrollment.progress} className="mb-5" />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {completedLessons} از {totalLessons} درس تماشا شده
                  </span>
                  <Button asChild size="sm">
                    <Link href={`/dashboard/courses/${enrollment.courseId}`}>
                      <PlayCircle size={15} />
                      ادامه یادگیری
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
