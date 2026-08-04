import "server-only";
import { prisma } from "@/lib/db";

export async function getFeaturedPrompts(limit = 3) {
  return prisma.aiTool.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// Landing showcase toggle: top featured prompts split by type so visitors
// can switch between "photo" and "video" prompts without a page navigation.
export async function getFeaturedPromptsByType(limit = 3) {
  const [image, video] = await Promise.all([
    prisma.aiTool.findMany({
      where: { active: true, featured: true, type: "IMAGE" },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.aiTool.findMany({
      where: { active: true, featured: true, type: "VIDEO" },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);
  return { image, video };
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
