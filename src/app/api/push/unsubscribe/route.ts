import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const bodySchema = z.object({ endpoint: z.string().url() });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({ where: { endpoint: parsed.data.endpoint } });
  return NextResponse.json({ ok: true });
}
