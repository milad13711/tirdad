import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen, LifeBuoy, Sparkles, Zap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getUserOverview } from "@/lib/queries/dashboard";
import { formatJalaliDateTime } from "@/lib/format";
import { generationStatusLabel, generationStatusVariant } from "@/lib/status-labels";

export default async function DashboardOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const {
    user,
    subscription,
    enrollments,
    generations,
    openTicketsCount,
    monthlyRunsUsed,
    dailyRunsUsed,
  } = await getUserOverview(session.sub);

  const dailyLimit = subscription?.plan.dailyRunLimit;
  const monthlyLimit = subscription?.plan.monthlyRunLimit;
  const inProgressCourses = enrollments.filter((e) => e.progress < 100);

  return (
    <div>
      <PageHeader
        title={`سلام ${user.name ?? "کاربر"} 👋`}
        description="خلاصه‌ای از وضعیت حساب و فعالیت‌های اخیر شما"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="پلن فعلی" value={subscription?.plan.name ?? "رایگان"} icon={Sparkles} />
        <StatCard
          label="اجرای باقی‌مانده امروز"
          value={dailyLimit ? `${Math.max(0, dailyLimit - dailyRunsUsed)} از ${dailyLimit}` : "نامحدود"}
          icon={Zap}
        />
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
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">اجرای ماهانه</span>
            <span>
              {monthlyRunsUsed} از {monthlyLimit ?? "نامحدود"}
            </span>
          </div>
          <Progress value={monthlyLimit ? (monthlyRunsUsed / monthlyLimit) * 100 : 100} />
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
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-bold">آخرین خروجی‌های هوش مصنوعی</h3>
          <Link
            href="/dashboard/ai-tools"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            مشاهده همه <ArrowLeft size={14} />
          </Link>
        </div>
        {generations.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            هنوز از هیچ ابزاری استفاده نکرده‌اید.
          </p>
        ) : (
          <div className="space-y-3">
            {generations.slice(0, 3).map((gen) => (
              <div
                key={gen.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <div className="text-sm font-medium">{gen.aiTool.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatJalaliDateTime(gen.createdAt)}
                  </div>
                </div>
                <Badge variant={generationStatusVariant[gen.status]}>
                  {generationStatusLabel[gen.status]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
