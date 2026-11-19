import "server-only";
import { headers } from "next/headers";

export async function getClientIp(): Promise<string | null> {
  const store = await headers();
  return store.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export function clientIpFromRequest(request: Request): string | null {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}
