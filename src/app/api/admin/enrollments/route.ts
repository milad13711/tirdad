import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

// expiresAt: ISO string to set an explicit expiry, null to grant lifetime
// access, or omitted together with extendDays to extend from the current
// expiry (or from now, if the enrollment had none).
const patchSchema = z.object({
  id: z.string().min(1),
  expiresAt: z.string().datetime().nullable().optional(),
  extendDays: z.coerce.number().int().optional(),
});

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const { id, expiresAt, extendDays } = parsed.data;

  let nextExpiresAt: Date | null | undefined;
  if (extendDays) {
    const enrollment = await prisma.enrollment.findUnique({ where: { id } });
    if (!enrollment) {
      return NextResponse.json({ error: "دسترسی یافت نشد" }, { status: 404 });
    }
    const base = enrollment.expiresAt && enrollment.expiresAt > new Date() ? enrollment.expiresAt : new Date();
    nextExpiresAt = new Date(base.getTime() + extendDays * 24 * 60 * 60 * 1000);
  } else if (expiresAt !== undefined) {
    nextExpiresAt = expiresAt ? new Date(expiresAt) : null;
  } else {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: { expiresAt: nextExpiresAt },
  });

  return NextResponse.json({ ok: true, enrollment });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "شناسه دسترسی الزامی است" }, { status: 400 });
  }

  await prisma.enrollment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
