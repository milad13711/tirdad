import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { BuyButton } from "@/components/dashboard/buy-button";
import { getSession } from "@/lib/auth/session";
import { formatToman, getPurchasableCourses } from "@/lib/queries/dashboard";

export default async function BrowseCoursesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const courses = await getPurchasableCourses(session.sub);

  return (
    <div>
      <PageHeader title="خرید دوره جدید" description="دوره‌های منتشرشده‌ای که هنوز خریداری نکرده‌اید" />

      {courses.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          در حال حاضر دوره جدیدی برای خرید موجود نیست.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 font-bold leading-7">{course.title}</h3>
              {course.description && (
                <p className="mb-4 flex-1 text-sm text-muted-foreground">{course.description}</p>
              )}
              <div className="mb-5 flex items-center justify-between">
                {course.level && (
                  <span className="text-xs text-muted-foreground">{course.level}</span>
                )}
                <span className="font-bold text-primary">{formatToman(course.price)} تومان</span>
              </div>
              <BuyButton payload={{ itemType: "COURSE", courseId: course.id }}>
                خرید دوره
              </BuyButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
