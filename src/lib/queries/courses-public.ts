import "server-only";
import { prisma } from "@/lib/db";

const demoLessonInclude = {
  lessons: { where: { isFreeDemo: true, videoUrl: { not: null } }, take: 1 },
} as const;

export async function getLandingCourses(limit = 3) {
  return prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: demoLessonInclude,
  });
}

export async function getAllPublishedCourses() {
  return prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: demoLessonInclude,
  });
}

// Full detail for the public /courses/[slug] page: every lesson's title
// and order (so visitors can see the syllabus), but videoUrl only for
// lessons marked as the free demo — locked lessons must not leak playable
// URLs to unauthenticated visitors.
export async function getCourseBySlug(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, order: true, isFreeDemo: true, videoUrl: true },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) return null;

  return {
    ...course,
    lessons: course.lessons.map((lesson) => ({
      ...lesson,
      videoUrl: lesson.isFreeDemo ? lesson.videoUrl : null,
    })),
  };
}
