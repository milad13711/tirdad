import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegister } from "@/components/site/pwa-register";
import { getSiteContent } from "@/lib/site-content";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// The root layout's metadata now reads the admin-editable site title/logo
// from the DB, so every route needs to render per-request — otherwise a
// branding change from /admin/settings wouldn't reach already-static pages
// (e.g. /login) until the next deploy. Same reasoning as src/app/page.tsx.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const title = `${content.siteTitle} | پرامپت‌های رایگان هوش مصنوعی و پکیج‌های آموزشی`;
  const description =
    "پرامپت‌های رایگان تولید عکس و فیلم با هوش مصنوعی، پکیج‌های آموزشی تخصصی و خدمات طراحی سفارشی برای رشد کسب‌وکار شما در اینستاگرام.";
  const icon = content.logoUrl || "/icons/icon-192.png";
  const appleIcon = content.logoUrl || "/icons/apple-touch-icon.png";

  return {
    metadataBase: new URL("https://tirdad.example.com"),
    title: {
      default: title,
      template: `%s | ${content.siteTitle}`,
    },
    description,
    keywords: [
      "پرامپت رایگان هوش مصنوعی",
      "پکیج آموزشی آنلاین",
      "تولید محتوا با AI",
      "طراحی تیزر و تصویر",
      "آموزش اینستاگرام",
    ],
    icons: {
      icon,
      apple: appleIcon,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: content.siteTitle,
    },
    openGraph: {
      type: "website",
      locale: "fa_IR",
      title,
      description,
      siteName: content.siteTitle,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#1a7fff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className={`${vazirmatn.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <PwaRegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
