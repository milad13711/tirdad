import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { notifyAdmins } from "@/lib/telegram";

const bodySchema = z.object({
  subject: z.string().min(3),
  message: z.string().min(5),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری شوید" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات تیکت نامعتبر است" }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: {
      userId: session.sub,
      subject: parsed.data.subject,
      messages: {
        create: { sender: "user", message: parsed.data.message },
      },
    },
  });

  void notifyAdmins(`🎫 تیکت جدید\nموضوع: ${ticket.subject}`);

  return NextResponse.json({ ok: true, ticket });
}
