import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { slugify } from "@/lib/slugify";

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().int().min(0),
  level: z.string().optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.coerce.number().int().min(0).optional(),
  level: z.string().optional(),
  published: z.boolean().optional(),
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
    return NextResponse.json({ error: "اطلاعات دوره نامعتبر است" }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: { ...parsed.data, slug: slugify(parsed.data.title) },
  });

  return NextResponse.json({ ok: true, course });
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
  const course = await prisma.course.update({ where: { id }, data });

  return NextResponse.json({ ok: true, course });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "شناسه دوره الزامی است" }, { status: 400 });
  }

  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
