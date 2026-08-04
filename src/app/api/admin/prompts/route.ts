import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const createSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["IMAGE", "VIDEO", "AUDIO"]),
  promptText: z.string().min(3),
  demoBeforeUrl: z.string().optional(),
  demoAfterUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).optional(),
  promptText: z.string().min(3).optional(),
  demoBeforeUrl: z.string().optional(),
  demoAfterUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
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
    return NextResponse.json({ error: "اطلاعات پرامپت نامعتبر است" }, { status: 400 });
  }

  const existing = await prisma.aiTool.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ error: "پرامپتی با این عنوان قبلاً ثبت شده است" }, { status: 409 });
  }

  const prompt = await prisma.aiTool.create({ data: parsed.data });
  return NextResponse.json({ ok: true, prompt });
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
  const prompt = await prisma.aiTool.update({ where: { id }, data });
  return NextResponse.json({ ok: true, prompt });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "شناسه پرامپت الزامی است" }, { status: 400 });
  }

  try {
    await prisma.aiTool.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "این پرامپت قبلاً در سابقه اجرا استفاده شده و قابل حذف نیست؛ به‌جاش غیرفعالش کنید" },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true });
}
