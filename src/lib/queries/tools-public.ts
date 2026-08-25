import "server-only";
import { prisma } from "@/lib/db";

export async function getLandingTools(limit = 3) {
  return prisma.toolPackage.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAllPublishedTools() {
  return prisma.toolPackage.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getToolBySlug(slug: string) {
  return prisma.toolPackage.findUnique({ where: { slug, published: true } });
}
