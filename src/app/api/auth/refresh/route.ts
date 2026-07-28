import { NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE, REFRESH_COOKIE, accessCookieOptions } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const refreshToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${REFRESH_COOKIE}=`))
    ?.split("=")[1];

  if (!refreshToken) {
    return NextResponse.json({ error: "نشست منقضی شده است" }, { status: 401 });
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    return NextResponse.json({ error: "نشست منقضی شده است" }, { status: 401 });
  }

  const accessToken = await signAccessToken({ sub: payload.sub, role: payload.role });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, accessToken, accessCookieOptions);
  return response;
}
