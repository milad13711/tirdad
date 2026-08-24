import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { CourseLearningView } from "@/components/dashboard/course-learning-view";
import { getSession } from "@/lib/auth/session";
import { getEnrollmentForLearning } from "@/lib/queries/dashboard";
import { formatJalali } from "@/lib/format";

export default async function CourseLearningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const data = await getEnrollmentForLearning(session.sub, id);
  if (!data) notFound();

  const { enrollment, expired, completedLessonIds } = data;

  return (
    <div>
      <PageHeader title={enrollment.course.title} description="مشاهده دروس و پیگیری پیشرفت یادگیری" />
      {expired ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <p className="font-bold text-destructive">مدت دسترسی شما به این پکیج به پایان رسیده است.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            دسترسی شما در تاریخ {enrollment.expiresAt ? formatJalali(enrollment.expiresAt) : ""} منقضی
            شد. برای تمدید دسترسی با پشتیبانی تماس بگیرید.
          </p>
        </div>
      ) : (
        <CourseLearningView
          lessons={enrollment.course.lessons}
          completedLessonIds={Array.from(completedLessonIds)}
          progress={enrollment.progress}
        />
      )}
    </div>
  );
}
