import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const bodySchema = z.object({ liked: z.boolean() });

// Public, unauthenticated: toggles a prompt's like counter up or down. The
// client tracks which prompts it already liked in localStorage and only
// ever sends the transition (like once, unlike once) — this just trusts
// that and clamps at zero so a replay can't go negative.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  try {
    const current = await prisma.aiTool.findUniqueOrThrow({ where: { id }, select: { likeCount: true } });
    const likeCount = Math.max(0, current.likeCount + (parsed.data.liked ? 1 : -1));
    const prompt = await prisma.aiTool.update({ where: { id }, data: { likeCount }, select: { likeCount: true } });
    return NextResponse.json({ ok: true, likeCount: prompt.likeCount });
  } catch {
    return NextResponse.json({ error: "پرامپت پیدا نشد" }, { status: 404 });
  }
}
