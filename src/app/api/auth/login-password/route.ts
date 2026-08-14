import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/auth/otp";
import { isRateLimited } from "@/lib/auth/rate-limit";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE, REFRESH_COOKIE, accessCookieOptions, refreshCookieOptions } from "@/lib/auth/cookies";

const bodySchema = z.object({ phone: z.string(), password: z.string().min(1) });

// Password login is only for ADMIN/STAFF system users (created from
// /admin/users) — customers never have a passwordHash and always sign in
// via OTP, so a customer phone number here just fails like a wrong password.
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "شماره موبایل نامعتبر است" }, { status: 400 });
  }

  if (isRateLimited(`login:password:${phone}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "تعداد تلاش‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." },
      { status: 429 },
    );
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "شماره موبایل یا رمز عبور اشتباه است" }, { status: 400 });
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "شماره موبایل یا رمز عبور اشتباه است" }, { status: 400 });
  }

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
