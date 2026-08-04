import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const createSchema = z.object({
  title: z.string().min(2),
  coverImage: z.string().optional(),
  videoUrl: z.string().optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).optional(),
  coverImage: z.string().optional(),
  videoUrl: z.string().optional(),
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
    return NextResponse.json({ error: "اطلاعات نمونه کار نامعتبر است" }, { status: 400 });
  }

  const sample = await prisma.teaserSample.create({ data: parsed.data });
  return NextResponse.json({ ok: true, sample });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const { id, ...data } = parsed.data;
  const sample = await prisma.teaserSample.update({ where: { id }, data });
  return NextResponse.json({ ok: true, sample });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "شناسه نمونه کار الزامی است" }, { status: 400 });
  }

  await prisma.teaserSample.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
