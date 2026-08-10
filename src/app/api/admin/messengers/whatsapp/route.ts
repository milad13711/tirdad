import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getPhoneNumberInfo, WhatsAppApiError } from "@/lib/messengers/whatsapp-client";

const connectSchema = z.object({
  token: z.string().trim().min(10, "توکن نامعتبر است"),
  phoneNumberId: z.string().trim().min(3, "Phone Number ID نامعتبر است"),
  verifyToken: z.string().trim().min(6, "Verify Token باید حداقل ۶ کاراکتر باشد"),
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const { token, phoneNumberId, verifyToken } = parsed.data;

  try {
    const info = await getPhoneNumberInfo(phoneNumberId, token);
    const connection = await prisma.messengerConnection.upsert({
      where: { provider: "WHATSAPP" },
      update: {
        token,
        phoneNumberId,
        verifyToken,
        botUsername: info.display_phone_number ?? info.verified_name ?? null,
        connectedAt: new Date(),
        lastPollError: null,
      },
      create: {
        provider: "WHATSAPP",
        token,
        phoneNumberId,
        verifyToken,
        botUsername: info.display_phone_number ?? info.verified_name ?? null,
        connectedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true, connection: { ...connection, token: undefined, verifyToken: undefined } });
  } catch (err) {
    const message = err instanceof WhatsAppApiError ? err.message : "اتصال ناموفق بود";
    return NextResponse.json({ error: `تایید نشد: ${message}` }, { status: 400 });
  }
}

export async function DELETE() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  await prisma.messengerConnection.updateMany({
    where: { provider: "WHATSAPP" },
    data: { token: null, phoneNumberId: null, verifyToken: null, botUsername: null, connectedAt: null },
  });

  return NextResponse.json({ ok: true });
}
