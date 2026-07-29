import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const bodySchema = z.object({
  lessonId: z.string().min(1),
  completed: z.boolean(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری شوید" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: parsed.data.lessonId } });
  if (!lesson) {
    return NextResponse.json({ error: "درس یافت نشد" }, { status: 404 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.sub, courseId: lesson.courseId } },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "شما در این دوره ثبت‌نام نکرده‌اید" }, { status: 403 });
  }

  if (parsed.data.completed) {
    await prisma.lessonCompletion.upsert({
      where: { userId_lessonId: { userId: session.sub, lessonId: lesson.id } },
      create: { userId: session.sub, lessonId: lesson.id },
      update: {},
    });
  } else {
    await prisma.lessonCompletion
      .delete({ where: { userId_lessonId: { userId: session.sub, lessonId: lesson.id } } })
      .catch(() => null);
  }

  const [totalLessons, completedLessons] = await Promise.all([
    prisma.lesson.count({ where: { courseId: lesson.courseId } }),
    prisma.lessonCompletion.count({
      where: { userId: session.sub, lesson: { courseId: lesson.courseId } },
    }),
  ]);

  const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  await prisma.enrollment.update({ where: { id: enrollment.id }, data: { progress } });

  return NextResponse.json({ ok: true, progress });
}
