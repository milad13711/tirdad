import { jwtVerify, SignJWT } from "jose";

export type SessionPayload = {
  sub: string;
  role: "USER" | "ADMIN" | "STAFF";
};

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "30d";

function getSecret(name: "access" | "refresh") {
  const raw =
    name === "access" ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET;
  if (!raw) {
    throw new Error(`Missing JWT secret: JWT_${name.toUpperCase()}_SECRET`);
  }
  return new TextEncoder().encode(raw);
}

export async function signAccessToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(getSecret("access"));
}

export async function signRefreshToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .sign(getSecret("refresh"));
}

export async function verifyAccessToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret("access"));
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret("refresh"));
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
