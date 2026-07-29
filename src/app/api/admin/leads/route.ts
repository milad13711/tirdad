import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const createSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  source: z.enum(["DIRECT", "COMMENT", "BIO_LINK"]),
  topic: z.string().optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  stage: z.enum(["NEW", "CONTACTED", "OFFERED", "CONVERTED", "LOST"]),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات لید نامعتبر است" }, { status: 400 });
  }

  const lead = await prisma.lead.create({ data: parsed.data });

  return NextResponse.json({ ok: true, lead });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id: parsed.data.id },
    data: { stage: parsed.data.stage },
  });

  return NextResponse.json({ ok: true, lead });
}
