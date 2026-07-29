import "server-only";
import { prisma } from "@/lib/db";

export async function getSiteSettings() {
  return prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}
