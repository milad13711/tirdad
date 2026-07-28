import "server-only";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "./cookies";
import { verifyAccessToken, type SessionPayload } from "./jwt";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}
