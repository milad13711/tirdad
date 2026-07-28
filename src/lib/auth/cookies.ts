export const ACCESS_COOKIE = "tirdad_at";
export const REFRESH_COOKIE = "tirdad_rt";

export const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 15, // 15 minutes, mirrors the access token TTL
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days, mirrors the refresh token TTL
};
