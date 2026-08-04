import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-content";

const keys = Object.keys(SITE_CONTENT_DEFAULTS) as (keyof typeof SITE_CONTENT_DEFAULTS)[];
const patchSchema = z.object(Object.fromEntries(keys.map((key) => [key, z.string().max(2000)])));

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = patchSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const current = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  const merged = { ...(current.content as object), ...parsed.data };
  const settings = await prisma.siteSettings.update({
    where: { id: 1 },
    data: { content: merged },
  });

  return NextResponse.json({ ok: true, content: settings.content });
}
