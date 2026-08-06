import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const bodySchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

// Public — a visitor can opt into notifications before logging in.
// If they are logged in, the subscription is linked to their account so an
// admin broadcast could later be scoped to specific users if needed.
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const session = await getSession();
  const { endpoint, keys } = parsed.data;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh: keys.p256dh, auth: keys.auth, userId: session?.sub ?? null },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userId: session?.sub ?? null },
  });

  return NextResponse.json({ ok: true });
}
