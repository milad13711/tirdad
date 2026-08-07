import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  eventKey: z.string().trim().min(2).max(60),
  message: z.string().trim().min(2).max(500),
});

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(120).optional(),
  eventKey: z.string().trim().min(2).max(60).optional(),
  message: z.string().trim().min(2).max(500).optional(),
  active: z.boolean().optional(),
});

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات تریگر نامعتبر است" }, { status: 400 });
  }

  const trigger = await prisma.smsTrigger.create({ data: parsed.data });
  return NextResponse.json({ ok: true, trigger });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const { id, ...rest } = parsed.data;
  const trigger = await prisma.smsTrigger.update({ where: { id }, data: rest });
  return NextResponse.json({ ok: true, trigger });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "شناسه تریگر الزامی است" }, { status: 400 });
  }

  await prisma.smsTrigger.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
