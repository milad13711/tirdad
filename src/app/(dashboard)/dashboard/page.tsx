import Link from "next/link";
import { ArrowLeft, BookOpen, LifeBuoy, Sparkles, Zap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { currentUser, myCourses, myGenerations } from "@/lib/mock-data";

const statusVariant = {
  "تکمیل‌شده": "success",
  "در حال پردازش": "warning",
  "ناموفق": "destructive",
} as const;

export default function DashboardOverviewPage() {
  return (
    <div>
      <PageHeader
        title={`سلام ${currentUser.name} 👋`}
        description="خلاصه‌ای از وضعیت حساب و فعالیت‌های اخیر شما"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="پلن فعلی" value={currentUser.plan} icon={Sparkles} />
        <StatCard
          label="اجرای باقی‌مانده امروز"
          value={`${currentUser.dailyRunsLimit - currentUser.dailyRunsUsed} از ${currentUser.dailyRunsLimit}`}
          icon={Zap}
        />
        <StatCard label="دوره‌های در حال یادگیری" value={`${myCourses.length}`} icon={BookOpen} />
        <StatCard label="تیکت‌های باز" value="۱" icon={LifeBuoy} />
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
          <div className="space-y-5">
            {myCourses.map((course) => (
              <div key={course.id}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{course.title}</span>
                  <span className="text-muted-foreground">
                    {course.completedLessons}/{course.lessons} درس
                  </span>
                </div>
                <Progress value={course.progress} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-5 font-bold">وضعیت اشتراک</h3>
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">اجرای ماهانه</span>
            <span>
              {currentUser.monthlyRunsUsed} از {currentUser.monthlyRunsLimit}
            </span>
          </div>
          <Progress
            value={(currentUser.monthlyRunsUsed / currentUser.monthlyRunsLimit) * 100}
          />
          <p className="mt-4 text-xs text-muted-foreground">
            تمدید بعدی: {currentUser.planRenewsAt}
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
        <div className="space-y-3">
          {myGenerations.slice(0, 3).map((gen) => (
            <div
              key={gen.id}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium">{gen.tool}</div>
                <div className="text-xs text-muted-foreground">{gen.date}</div>
              </div>
              <Badge variant={statusVariant[gen.status]}>{gen.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
