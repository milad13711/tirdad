import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalizePhone, generateOtpCode, hashOtpCode, otpExpiryDate } from "@/lib/auth/otp";
import { isRateLimited } from "@/lib/auth/rate-limit";
import { getSmsProvider } from "@/lib/sms";
import { logEvent } from "@/lib/log-event";

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
    void logEvent({ action: "otp.request", success: false, phone, message: "rate_limited", request });
    return NextResponse.json(
      { error: "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." },
      { status: 429 },
    );
  }

  const code = generateOtpCode();
  const otp = await prisma.otpCode.create({
    data: {
      phone,
      codeHash: await hashOtpCode(code),
      expiresAt: otpExpiryDate(),
    },
  });

  try {
    await getSmsProvider().sendOtp(phone, code);
  } catch (err) {
    // The OTP row above is now useless — the user never received the code
    // it corresponds to, so there's no reason to leave it active for its
    // 3-minute window. Logged with the real provider error for admin
    // diagnosis; the user gets a generic, actionable message instead of a
    // silent 500 (the actual bug this replaces — see src/lib/sms/limo.ts).
    await prisma.otpCode.delete({ where: { id: otp.id } }).catch(() => {});
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    console.error(`[otp] SMS send failed for ${phone}:`, message);
    void logEvent({ action: "otp.request", success: false, phone, message, request });
    return NextResponse.json(
      { error: "ارسال پیامک ناموفق بود. لطفاً چند لحظه دیگر دوباره تلاش کنید یا با پشتیبانی تماس بگیرید." },
      { status: 502 },
    );
  }

  void logEvent({ action: "otp.request", success: true, phone, request });
  return NextResponse.json({ ok: true });
}
