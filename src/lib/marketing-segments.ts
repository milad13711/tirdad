// Shared between server queries (src/lib/queries/marketing.ts) and client
// components (src/components/admin/marketing-panel.tsx) — kept free of
// "server-only" so both can import it.
export const SEGMENTS = [
  { key: "PROMPT", label: "پرامپت گرفته‌اند" },
  { key: "COURSE", label: "دوره خریده‌اند" },
  { key: "PAGE_ANALYSIS", label: "درخواست آنالیز پیج داده‌اند" },
  { key: "CRM", label: "CRM اینستاگرام خریده‌اند" },
  { key: "INSTAGRAM_DM_ONLY", label: "فقط توی اینستاگرام دایرکت داده‌اند" },
] as const;

export type SegmentKey = (typeof SEGMENTS)[number]["key"];
export const SEGMENT_KEYS = SEGMENTS.map((s) => s.key) as SegmentKey[];
