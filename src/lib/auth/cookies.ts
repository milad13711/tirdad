export const ACCESS_COOKIE = "tirdad_at";
export const REFRESH_COOKIE = "tirdad_rt";

// `Secure` cookies are silently dropped by browsers on a plain HTTP origin —
// tying this to NODE_ENV (always "production" under `npm start`/PM2) instead
// of the site's actual protocol breaks login on any deploy that hasn't added
// TLS yet. Derive it from NEXT_PUBLIC_APP_URL, which already encodes that.
const isHttps = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false;

export const accessCookieOptions = {
  httpOnly: true,
  secure: isHttps,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 15, // 15 minutes, mirrors the access token TTL
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isHttps,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days, mirrors the refresh token TTL
};
