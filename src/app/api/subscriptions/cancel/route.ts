import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const bodySchema = z.object({ subscriptionId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری شوید" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: parsed.data.subscriptionId },
  });
  if (!subscription || subscription.userId !== session.sub) {
    return NextResponse.json({ error: "اشتراک یافت نشد" }, { status: 404 });
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "CANCELED" },
  });

  return NextResponse.json({ ok: true });
}
