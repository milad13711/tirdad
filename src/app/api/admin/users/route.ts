import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { isFullAdmin } from "@/lib/auth/roles";
import { normalizePhone } from "@/lib/auth/otp";

const SALT_ROUNDS = 10;

const createSchema = z.object({
  phone: z.string().min(1),
  name: z.string().trim().optional(),
  role: z.enum(["ADMIN", "STAFF"]),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد").optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
  name: z.string().trim().optional(),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد").optional(),
});

async function requireFullAdmin() {
  const session = await getSession();
  return isFullAdmin(session) ? session : null;
}

export async function POST(request: Request) {
  if (!(await requireFullAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "شماره موبایل نامعتبر است" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: "کاربری با این شماره از قبل وجود دارد" }, { status: 400 });
  }

  const passwordHash = parsed.data.password ? await bcrypt.hash(parsed.data.password, SALT_ROUNDS) : null;

  const user = await prisma.user.create({
    data: { phone, name: parsed.data.name || null, role: parsed.data.role, passwordHash },
  });

  return NextResponse.json({ ok: true, user: { ...user, passwordHash: undefined } });
}

export async function PATCH(request: Request) {
  const session = await requireFullAdmin();
  if (!session) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const { id, password, ...rest } = parsed.data;

  if (id === session.sub && rest.role && rest.role !== "ADMIN") {
    return NextResponse.json({ error: "نمی‌توانید سطح دسترسی خودتان را کاهش دهید" }, { status: 400 });
  }

  const data: { role?: "ADMIN" | "STAFF"; name?: string; passwordHash?: string } = { ...rest };
  if (password) data.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ ok: true, user: { ...user, passwordHash: undefined } });
}

export async function DELETE(request: Request) {
  const session = await requireFullAdmin();
  if (!session) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "شناسه کاربر الزامی است" }, { status: 400 });
  }
  if (id === session.sub) {
    return NextResponse.json({ error: "نمی‌توانید حساب خودتان را حذف کنید" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
