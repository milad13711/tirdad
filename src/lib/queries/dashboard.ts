import "server-only";
import { prisma } from "@/lib/db";

export async function getUserOverview(userId: string) {
  const [user, subscription, enrollments, openTicketsCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: { userId },
      include: { course: { include: { lessons: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ticket.count({ where: { userId, status: { not: "CLOSED" } } }),
  ]);

  return { user, subscription, enrollments, openTicketsCount };
}

export async function getUserEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    include: { course: { include: { lessons: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEnrollmentForLearning(userId: string, courseId: string) {
  const [enrollment, completions] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: { course: { include: { lessons: { orderBy: { order: "asc" } } } } },
    }),
    prisma.lessonCompletion.findMany({
      where: { userId, lesson: { courseId } },
      select: { lessonId: true },
    }),
  ]);

  if (!enrollment) return null;
  return { enrollment, completedLessonIds: new Set(completions.map((c) => c.lessonId)) };
}

export async function getPurchasableCourses(userId: string) {
  return prisma.course.findMany({
    where: { published: true, enrollments: { none: { userId } } },
    orderBy: { createdAt: "desc" },
  });
}

// Only prompts the user can actually read: free ones, plus premium ones
// they've purchased. Locked premium prompts belong in the public gallery
// (/prompts), where they're the thing being sold — not in "your prompts".
export async function getActivePrompts(userId: string) {
  return prisma.aiTool.findMany({
    where: { active: true, OR: [{ price: 0 }, { purchases: { some: { userId } } }] },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPlans() {
  return prisma.subscriptionPlan.findMany({ orderBy: { price: "asc" } });
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { transactions: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserTickets(userId: string) {
  return prisma.ticket.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}
