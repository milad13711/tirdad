import "server-only";
import { prisma } from "@/lib/db";

export async function getAdminStats() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [revenueAgg, activeUsers, aiRuns, newLeads] = await Promise.all([
    prisma.order.aggregate({
      where: { status: "PAID", createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.user.count(),
    prisma.aiGeneration.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.lead.count({ where: { createdAt: { gte: monthStart } } }),
  ]);

  return {
    monthlyRevenue: revenueAgg._sum.amount ?? 0,
    activeUsers,
    aiRuns,
    newLeads,
  };
}

export async function getAdminOrders() {
  return prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getAdminUsers() {
  return prisma.user.findMany({
    include: { subscriptions: { where: { status: "ACTIVE" }, include: { plan: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminCourses() {
  return prisma.course.findMany({
    include: { _count: { select: { enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminCourseWithLessons(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
}

export async function getAdminPrompts() {
  return prisma.aiTool.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdminServiceRequests() {
  return prisma.serviceRequest.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminLeads() {
  return prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdminBlogPosts() {
  return prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdminCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}
