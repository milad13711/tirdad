import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/site-content";

// Otherwise Next prerenders this once at build time — an admin changing the
// logo/title from /admin/settings wouldn't take effect until the next
// deploy. Same reasoning as src/app/page.tsx.
export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const content = await getSiteContent();
  const icon192 = content.logoUrl || "/icons/icon-192.png";
  const icon512 = content.logoUrl || "/icons/icon-512.png";

  return {
    name: content.siteTitle,
    short_name: content.siteTitle,
    description: "پرامپت‌های رایگان هوش مصنوعی، پکیج‌های آموزشی و خدمات رشد کسب‌وکار در اینستاگرام.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#1a7fff",
    dir: "rtl",
    lang: "fa",
    icons: [
      { src: icon192, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: icon512, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: icon512, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
