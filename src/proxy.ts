import { NextResponse, type NextRequest } from "next/server";
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE, REFRESH_COOKIE, accessCookieOptions } from "@/lib/auth/cookies";

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

export async function proxy(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;

  let session = accessToken ? await verifyAccessToken(accessToken) : null;
  let refreshedAccessToken: string | null = null;

  if (!session) {
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    const refreshPayload = refreshToken ? await verifyRefreshToken(refreshToken) : null;
    if (refreshPayload) {
      session = refreshPayload;
      refreshedAccessToken = await signAccessToken(refreshPayload);
    }
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();
  if (refreshedAccessToken) {
    response.cookies.set(ACCESS_COOKIE, refreshedAccessToken, accessCookieOptions);
  }
  return response;
}
