import { randomBytes } from "node:crypto";

/**
 * Persian titles rarely survive a Latin-only slugify, so this always
 * suffixes a short random id to guarantee uniqueness rather than relying on
 * the transliterated text alone.
 */
export function slugify(title: string) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = randomBytes(3).toString("hex");
  return base ? `${base}-${suffix}` : suffix;
}
