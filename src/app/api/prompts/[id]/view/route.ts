import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public, unauthenticated: bumps a prompt's view counter. The client only
// calls this once per prompt per browser (deduped via localStorage), so no
// server-side dedup — a little undercounting from cleared storage is fine
// for a display-only metric.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const prompt = await prisma.aiTool.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });
    return NextResponse.json({ ok: true, viewCount: prompt.viewCount });
  } catch {
    return NextResponse.json({ error: "پرامپت پیدا نشد" }, { status: 404 });
  }
}
