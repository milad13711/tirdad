import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { CourseLearningView } from "@/components/dashboard/course-learning-view";
import { getSession } from "@/lib/auth/session";
import { getEnrollmentForLearning } from "@/lib/queries/dashboard";

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

  const { enrollment, completedLessonIds } = data;

  return (
    <div>
      <PageHeader title={enrollment.course.title} description="مشاهده دروس و پیگیری پیشرفت یادگیری" />
      <CourseLearningView
        lessons={enrollment.course.lessons}
        completedLessonIds={Array.from(completedLessonIds)}
        progress={enrollment.progress}
      />
    </div>
  );
}
