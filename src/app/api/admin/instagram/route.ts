import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const connectSchema = z.object({
  accessToken: z.string().min(10),
  businessAccountId: z.string().min(1),
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

  const parsed = connectSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "توکن و شناسه اکانت الزامی است" }, { status: 400 });
  }

  const connection = await prisma.instagramConnection.upsert({
    where: { id: 1 },
    update: { ...parsed.data, connectedAt: new Date(), lastSyncError: null },
    create: { id: 1, ...parsed.data, connectedAt: new Date() },
  });

  return NextResponse.json({
    ok: true,
    connectedAt: connection.connectedAt,
    businessAccountId: connection.businessAccountId,
  });
}

export async function DELETE() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  await prisma.instagramConnection.upsert({
    where: { id: 1 },
    update: { accessToken: null, businessAccountId: null, connectedAt: null, lastSyncError: null },
    create: { id: 1 },
  });

  return NextResponse.json({ ok: true });
}
