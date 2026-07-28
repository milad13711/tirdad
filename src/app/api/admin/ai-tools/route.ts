import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const bodySchema = z.object({
  name: z.string().min(2),
  type: z.enum(["IMAGE", "VIDEO", "AUDIO"]),
  creditCost: z.coerce.number().int().min(1),
  hiddenPrompt: z.string().min(3),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات ابزار نامعتبر است" }, { status: 400 });
  }

  const tool = await prisma.aiTool.create({ data: parsed.data });

  // hiddenPrompt intentionally excluded from the response — it must never
  // reach any client, including the admin dashboard that just created it.
  return NextResponse.json({
    ok: true,
    tool: { id: tool.id, name: tool.name, type: tool.type, creditCost: tool.creditCost },
  });
}
