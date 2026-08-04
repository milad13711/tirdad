import "server-only";
import { prisma } from "@/lib/db";

export async function getActiveTeaserSamples(limit = 6) {
  return prisma.teaserSample.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
