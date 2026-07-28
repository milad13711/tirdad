import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalizePhone, generateOtpCode, hashOtpCode, otpExpiryDate } from "@/lib/auth/otp";
import { isRateLimited } from "@/lib/auth/rate-limit";
import { getSmsProvider } from "@/lib/sms";

const bodySchema = z.object({ phone: z.string() });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "شماره موبایل نامعتبر است" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "شماره موبایل نامعتبر است" }, { status: 400 });
  }

  if (isRateLimited(`otp:request:${phone}`, 3, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." },
      { status: 429 },
    );
  }

  const code = generateOtpCode();
  await prisma.otpCode.create({
    data: {
      phone,
      codeHash: await hashOtpCode(code),
      expiresAt: otpExpiryDate(),
    },
  });

  await getSmsProvider().sendOtp(phone, code);

  return NextResponse.json({ ok: true });
}
