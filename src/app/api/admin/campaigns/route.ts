import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { productKey } from "@/lib/product-key";

const createSchema = z.object({
  type: z.enum(["COURSE", "TOOL_PACKAGE"]),
  id: z.string().min(1),
  label: z.string().trim().optional(),
});

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

function randomSlug() {
  return randomBytes(4).toString("hex");
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const exists =
    parsed.data.type === "COURSE"
      ? await prisma.course.findUnique({ where: { id: parsed.data.id }, select: { id: true } })
      : await prisma.toolPackage.findUnique({ where: { id: parsed.data.id }, select: { id: true } });
  if (!exists) {
    return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
  }

  let slug = randomSlug();
  for (let i = 0; i < 5 && (await prisma.campaignLink.findUnique({ where: { slug } })); i++) {
    slug = randomSlug();
  }

  const link = await prisma.campaignLink.create({
    data: { slug, productKey: productKey(parsed.data.type, parsed.data.id), label: parsed.data.label || null },
  });

  return NextResponse.json({ ok: true, link });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "شناسه لینک الزامی است" }, { status: 400 });
  }
  await prisma.campaignLink.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
