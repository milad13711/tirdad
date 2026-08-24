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

export async function getAdminOrders(take = 20) {
  return prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

// Real paying customers only (role USER) — system users (ADMIN/STAFF,
// managed from /admin/users) are a separate list, see getSystemUsers().
export async function getAdminUsers() {
  return prisma.user.findMany({
    where: { role: "USER" },
    include: { subscriptions: { where: { status: "ACTIVE" }, include: { plan: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSystemUsers() {
  return prisma.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
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

// Purchasers of a package with their access-expiry state, for admin review
// and manual extension/revocation from /admin/courses/[id]/students.
export async function getAdminCourseEnrollments(courseId: string) {
  const [course, enrollments] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.enrollment.findMany({
      where: { courseId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { course, enrollments };
}

export async function getAdminPrompts() {
  return prisma.aiTool.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdminLeads() {
  return prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
}

// Leads submitted from the landing page's free Instagram page-analysis
// form always carry a pageUrl (see the form at
// src/components/site/instagram-analysis-form.tsx) — other lead sources
// never set it, so this is what separates the two in the admin UI.
export async function getPageAnalysisRequests() {
  return prisma.lead.findMany({
    where: { pageUrl: { not: null } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInstagramConnection() {
  return prisma.instagramConnection.findUnique({ where: { id: 1 } });
}

export async function getSmsSettings() {
  return prisma.smsSettings.findUnique({ where: { id: 1 } });
}

export async function getVpnConfig() {
  return prisma.vpnConfig.findUnique({ where: { id: 1 } });
}

export async function getSmsTriggers() {
  return prisma.smsTrigger.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdminBlogPosts() {
  return prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdminCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}
