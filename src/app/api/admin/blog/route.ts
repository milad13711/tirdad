import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { slugify } from "@/lib/slugify";

const createSchema = z.object({
  title: z.string().min(2),
  excerpt: z.string().optional(),
  content: z.string().optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  published: z.boolean(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات مقاله نامعتبر است" }, { status: 400 });
  }

  const post = await prisma.blogPost.create({
    data: { ...parsed.data, slug: slugify(parsed.data.title) },
  });

  return NextResponse.json({ ok: true, post });
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

  const post = await prisma.blogPost.update({
    where: { id: parsed.data.id },
    data: parsed.data.published
      ? { status: "PUBLISHED", publishedAt: new Date() }
      : { status: "DRAFT", publishedAt: null },
  });

  return NextResponse.json({ ok: true, post });
}
