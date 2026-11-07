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

// Deliberately NOT filtered by `published` here — a buyer who already owns
// an unpublished package (e.g. the admin is editing it) must still be able
// to open its page and download it. The caller (tools/[slug]/page.tsx)
// enforces that only an owner/admin can see an unpublished package.
export async function getToolBySlug(slug: string) {
  return prisma.toolPackage.findUnique({ where: { slug } });
}
