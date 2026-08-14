import type { SessionPayload } from "./jwt";

// STAFF (پشتیبان) only gets the fast-follow-up sections — inbox, page
// analysis requests, orders, marketing. Everything else (content, site
// settings, coupons, system users, reports, CRM/Instagram connection) is
// ADMIN-only ("مدیر کل"). Kept as a single source of truth since both
// pages and API routes need to agree on the boundary.
export function isFullAdmin(session: SessionPayload | null): boolean {
  return session?.role === "ADMIN";
}

export function isStaffOrAdmin(session: SessionPayload | null): boolean {
  return session?.role === "ADMIN" || session?.role === "STAFF";
}
