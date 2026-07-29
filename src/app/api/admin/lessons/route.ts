import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const createSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(2),
  videoUrl: z.string().optional(),
  isFreeDemo: z.coerce.boolean().optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).optional(),
  videoUrl: z.string().optional(),
  isFreeDemo: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
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
    return NextResponse.json({ error: "اطلاعات درس نامعتبر است" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({
    where: { id: parsed.data.courseId },
    select: { _count: { select: { lessons: true } } },
  });
  if (!course) {
    return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });
  }

  const lesson = await prisma.lesson.create({
    data: {
      courseId: parsed.data.courseId,
      title: parsed.data.title,
      videoUrl: parsed.data.videoUrl || null,
      isFreeDemo: parsed.data.isFreeDemo ?? false,
      order: course._count.lessons + 1,
    },
  });

  return NextResponse.json({ ok: true, lesson });
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
  const lesson = await prisma.lesson.update({ where: { id }, data });

  return NextResponse.json({ ok: true, lesson });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "شناسه درس الزامی است" }, { status: 400 });
  }

  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
