import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { slugify } from "@/lib/slugify";

const createSchema = z.object({
  title: z.string().min(2),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
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
    return NextResponse.json({ error: "اطلاعات مقاله نامعتبر است" }, { status: 400 });
  }

  const post = await prisma.blogPost.create({
    data: { ...parsed.data, slug: slugify(parsed.data.title) },
  });

  return NextResponse.json({ ok: true, post });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const { id, published, ...rest } = parsed.data;
  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...rest,
      ...(published === undefined
        ? {}
        : published
          ? { status: "PUBLISHED", publishedAt: new Date() }
          : { status: "DRAFT", publishedAt: null }),
    },
  });

  return NextResponse.json({ ok: true, post });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "شناسه مقاله الزامی است" }, { status: 400 });
  }

  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
