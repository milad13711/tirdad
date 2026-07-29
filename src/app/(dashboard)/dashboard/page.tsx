import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen, LifeBuoy, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Progress } from "@/components/ui/progress";
import { getSession } from "@/lib/auth/session";
import { getUserOverview } from "@/lib/queries/dashboard";
import { formatJalaliDateTime } from "@/lib/format";

export default async function DashboardOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { user, subscription, enrollments, openTicketsCount } = await getUserOverview(session.sub);

  const inProgressCourses = enrollments.filter((e) => e.progress < 100);

  return (
    <div>
      <PageHeader
        title={`سلام ${user.name ?? "کاربر"} 👋`}
        description="خلاصه‌ای از وضعیت حساب و فعالیت‌های اخیر شما"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="پلن فعلی" value={subscription?.plan.name ?? "رایگان"} icon={Sparkles} />
        <StatCard
          label="دوره‌های در حال یادگیری"
          value={`${inProgressCourses.length}`}
          icon={BookOpen}
        />
        <StatCard label="تیکت‌های باز" value={`${openTicketsCount}`} icon={LifeBuoy} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-bold">دوره‌های در حال یادگیری</h3>
            <Link
              href="/dashboard/courses"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              مشاهده همه <ArrowLeft size={14} />
            </Link>
          </div>
          {enrollments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              هنوز در دوره‌ای ثبت‌نام نکرده‌اید.
            </p>
          ) : (
            <div className="space-y-5">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{enrollment.course.title}</span>
                    <span className="text-muted-foreground">
                      {Math.round((enrollment.progress / 100) * enrollment.course.lessons.length)}/
                      {enrollment.course.lessons.length} درس
                    </span>
                  </div>
                  <Progress value={enrollment.progress} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-5 font-bold">وضعیت اشتراک</h3>
          <p className="text-xl font-extrabold text-primary">{subscription?.plan.name ?? "رایگان"}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            {subscription
              ? `تمدید بعدی: ${formatJalaliDateTime(subscription.currentPeriodEnd)}`
              : "در حال حاضر پلن فعالی ندارید."}
          </p>
          <Link
            href="/dashboard/subscription"
            className="mt-5 flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            مدیریت اشتراک
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">پرامپت‌های رایگان</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              پرامپت‌های آماده با نمونه قبل/بعد — کپی کنید و استفاده کنید
            </p>
          </div>
          <Link
            href="/dashboard/prompts"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            مشاهده گالری <ArrowLeft size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
