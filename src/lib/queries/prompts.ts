import "server-only";
import { prisma } from "@/lib/db";

export async function getFeaturedPrompts(limit = 3) {
  return prisma.aiTool.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

const GALLERY_PAGE_SIZE = 12;

export async function getPromptsGalleryFirstPage() {
  const [items, tagRows] = await Promise.all([
    prisma.aiTool.findMany({
      where: { active: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: GALLERY_PAGE_SIZE + 1,
    }),
    prisma.aiTool.findMany({ where: { active: true }, select: { tags: true } }),
  ]);

  const hasMore = items.length > GALLERY_PAGE_SIZE;
  const page = hasMore ? items.slice(0, GALLERY_PAGE_SIZE) : items;
  const tags = [...new Set(tagRows.flatMap((r) => r.tags))].sort();

  return {
    items: page,
    nextCursor: hasMore ? page[page.length - 1].id : null,
    tags,
  };
}
