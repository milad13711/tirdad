import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { notifyAdmins } from "@/lib/telegram";
import { leadSourceLabel } from "@/lib/status-labels";

const createSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  source: z.enum(["DIRECT", "COMMENT", "BIO_LINK"]),
  topic: z.string().optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  topic: z.string().optional(),
  stage: z.enum(["NEW", "CONTACTED", "OFFERED", "CONVERTED", "LOST"]).optional(),
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
    return NextResponse.json({ error: "اطلاعات لید نامعتبر است" }, { status: 400 });
  }

  const lead = await prisma.lead.create({ data: parsed.data });

  void notifyAdmins(`👤 لید جدید\n${lead.name} — ${leadSourceLabel[lead.source]}`);

  return NextResponse.json({ ok: true, lead });
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
  const lead = await prisma.lead.update({ where: { id }, data });

  return NextResponse.json({ ok: true, lead });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "شناسه لید الزامی است" }, { status: 400 });
  }

  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
