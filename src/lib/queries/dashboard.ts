import { prisma } from "@/lib/db";

export function formatToman(amount: number) {
  return amount.toLocaleString("fa-IR");
}

export function formatJalali(date: Date) {
  return date.toLocaleDateString("fa-IR");
}

export function formatJalaliDateTime(date: Date) {
  return `${date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })} - ${formatJalali(date)}`;
}

export async function getUserOverview(userId: string) {
  const [user, subscription, enrollments, generations, openTicketsCount] = await Promise.all([
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
    prisma.aiGeneration.findMany({
      where: { userId },
      include: { aiTool: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.ticket.count({ where: { userId, status: { not: "CLOSED" } } }),
  ]);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const [monthlyRunsUsed, dailyRunsUsed] = await Promise.all([
    prisma.aiGeneration.count({ where: { userId, createdAt: { gte: monthStart } } }),
    prisma.aiGeneration.count({ where: { userId, createdAt: { gte: dayStart } } }),
  ]);

  return {
    user,
    subscription,
    enrollments,
    generations,
    openTicketsCount,
    monthlyRunsUsed,
    dailyRunsUsed,
  };
}

export async function getUserEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    include: { course: { include: { lessons: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPurchasableCourses(userId: string) {
  return prisma.course.findMany({
    where: { published: true, enrollments: { none: { userId } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserGenerations(userId: string) {
  return prisma.aiGeneration.findMany({
    where: { userId },
    include: { aiTool: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveAiTools() {
  return prisma.aiTool.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
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
