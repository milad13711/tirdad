import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getPurchasedPromptIds } from "@/lib/queries/prompts";

const PAGE_SIZE = 12;

// Public, unauthenticated: powers the /prompts gallery's search, tag
// filter, and infinite scroll. Premium prompts the requester hasn't bought
// have promptText/usageInstructions redacted below — see getPurchasedPromptIds.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const tag = url.searchParams.get("tag")?.trim() ?? "";
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const session = await getSession();
  const purchasedIds = await getPurchasedPromptIds(session?.sub ?? null);

  const where: Prisma.AiToolWhereInput = {
    active: true,
    ...(tag ? { tags: { has: tag } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { promptText: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const items = await prisma.aiTool.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = items.length > PAGE_SIZE;
  const page = hasMore ? items.slice(0, PAGE_SIZE) : items;

  // Only computed on the first page — the filter bar doesn't need to
  // refresh its tag list as the user scrolls or searches.
  const allTags = cursor
    ? undefined
    : await prisma.aiTool
        .findMany({ where: { active: true }, select: { tags: true } })
        .then((rows) => [...new Set(rows.flatMap((r) => r.tags))].sort());

  const lockedPage = page.map((item) => {
    const owned = item.price === 0 || purchasedIds.has(item.id);
    return {
      ...item,
      owned,
      promptText: owned ? item.promptText : "",
      usageInstructions: owned ? item.usageInstructions : null,
    };
  });

  return NextResponse.json({
    items: lockedPage,
    nextCursor: hasMore ? page[page.length - 1].id : null,
    tags: allTags,
  });
}
