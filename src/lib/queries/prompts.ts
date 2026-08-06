import "server-only";
import { prisma } from "@/lib/db";

interface Lockable {
  id: string;
  price: number;
  promptText: string;
  usageInstructions: string | null;
}

// price > 0 and not in purchasedIds means locked: promptText and
// usageInstructions must never reach the client, or the paywall is
// pointless (anyone could just read the network response).
function applyLock<T extends Lockable>(item: T, purchasedIds: Set<string>): T & { owned: boolean } {
  const owned = item.price === 0 || purchasedIds.has(item.id);
  return {
    ...item,
    owned,
    promptText: owned ? item.promptText : "",
    usageInstructions: owned ? item.usageInstructions : null,
  };
}

export async function getPurchasedPromptIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await prisma.promptPurchase.findMany({ where: { userId }, select: { aiToolId: true } });
  return new Set(rows.map((r) => r.aiToolId));
}

export async function getFeaturedPrompts(limit = 3, purchasedIds: Set<string> = new Set()) {
  const rows = await prisma.aiTool.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((r) => applyLock(r, purchasedIds));
}

// Landing showcase toggle: top featured prompts split by type so visitors
// can switch between "photo" and "video" prompts without a page navigation.
export async function getFeaturedPromptsByType(limit = 3, purchasedIds: Set<string> = new Set()) {
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
  return {
    image: image.map((r) => applyLock(r, purchasedIds)),
    video: video.map((r) => applyLock(r, purchasedIds)),
  };
}

const GALLERY_PAGE_SIZE = 12;

export async function getPromptsGalleryFirstPage(
  purchasedIds: Set<string> = new Set(),
  ensureIncludeId?: string,
) {
  const [items, tagRows] = await Promise.all([
    prisma.aiTool.findMany({
      where: { active: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: GALLERY_PAGE_SIZE + 1,
    }),
    prisma.aiTool.findMany({ where: { active: true }, select: { tags: true } }),
  ]);

  const hasMore = items.length > GALLERY_PAGE_SIZE;
  let page = hasMore ? items.slice(0, GALLERY_PAGE_SIZE) : items;
  const tags = [...new Set(tagRows.flatMap((r) => r.tags))].sort();

  // After a prompt purchase, the payment callback redirects back here with
  // ?purchased=<id> so the just-bought prompt is visible and auto-revealed
  // — but pagination might not have reached it yet, so fetch and pin it to
  // the front if it's missing from this page.
  if (ensureIncludeId && !page.some((p) => p.id === ensureIncludeId)) {
    const extra = await prisma.aiTool.findFirst({ where: { id: ensureIncludeId, active: true } });
    if (extra) page = [extra, ...page];
  }

  return {
    items: page.map((p) => applyLock(p, purchasedIds)),
    nextCursor: hasMore ? items[GALLERY_PAGE_SIZE - 1].id : null,
    tags,
  };
}
