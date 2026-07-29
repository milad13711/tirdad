import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const createSchema = z.object({
  code: z
    .string()
    .min(3)
    .transform((value) => value.trim().toUpperCase()),
  discountPercent: z.coerce.number().int().min(1).max(100),
  usageLimit: z.coerce.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  active: z.boolean(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات کد تخفیف نامعتبر است" }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
  if (existing) {
    return NextResponse.json({ error: "این کد تخفیف قبلاً ثبت شده است" }, { status: 409 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: parsed.data.code,
      discountPercent: parsed.data.discountPercent,
      usageLimit: parsed.data.usageLimit,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    },
  });

  return NextResponse.json({ ok: true, coupon });
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

  const coupon = await prisma.coupon.update({
    where: { id: parsed.data.id },
    data: { active: parsed.data.active },
  });

  return NextResponse.json({ ok: true, coupon });
}
