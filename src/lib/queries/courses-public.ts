import "server-only";
import { prisma } from "@/lib/db";

const demoLessonInclude = {
  lessons: { where: { isFreeDemo: true, videoUrl: { not: null } }, take: 1 },
} as const;

export async function getLandingCourses(limit = 3) {
  return prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
    take: limit,
    include: demoLessonInclude,
  });
}

export async function getAllPublishedCourses() {
  return prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
    include: demoLessonInclude,
  });
}
