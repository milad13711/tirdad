import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalizePhone, verifyOtpCode } from "@/lib/auth/otp";
import { isRateLimited } from "@/lib/auth/rate-limit";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE, REFRESH_COOKIE, accessCookieOptions, refreshCookieOptions } from "@/lib/auth/cookies";

const bodySchema = z.object({ phone: z.string(), code: z.string() });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "شماره موبایل نامعتبر است" }, { status: 400 });
  }

  if (isRateLimited(`otp:verify:${phone}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "تعداد تلاش‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." },
      { status: 429 },
    );
  }

  const otp = await prisma.otpCode.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp || otp.attempts >= 5) {
    return NextResponse.json({ error: "کد تایید منقضی شده یا نامعتبر است" }, { status: 400 });
  }

  const isValid = await verifyOtpCode(parsed.data.code, otp.codeHash);
  if (!isValid) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return NextResponse.json({ error: "کد تایید نادرست است" }, { status: 400 });
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone },
  });

  const sessionPayload = { sub: user.id, role: user.role };
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(sessionPayload),
    signRefreshToken(sessionPayload),
  ]);

  const response = NextResponse.json({
    ok: true,
    user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
  });
  response.cookies.set(ACCESS_COOKIE, accessToken, accessCookieOptions);
  response.cookies.set(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  return response;
}
