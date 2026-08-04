import { randomBytes } from "node:crypto";

/**
 * Persian titles rarely survive a Latin-only slugify, so this always
 * suffixes a short random id to guarantee uniqueness rather than relying on
 * the transliterated text alone.
 *
 * Persian characters are deliberately dropped rather than kept in the
 * slug: this Next.js setup 404s on dynamic-route params containing them
 * (confirmed — an ASCII slug round-trips through /blog/[slug] fine, an
 * otherwise-byte-identical Persian one doesn't), so for a Farsi-titled
 * site an ASCII-only slug is the only reliable one. Titles with no Latin
 * words at all just fall back to "post-<id>".
 */
export function slugify(title: string) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = randomBytes(3).toString("hex");
  return base ? `${base}-${suffix}` : `post-${suffix}`;
}
