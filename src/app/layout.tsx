import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tirdad.example.com"),
  title: {
    default: "تیرداد | پلتفرم آموزش، ابزار هوش مصنوعی و رشد اینستاگرام",
    template: "%s | تیرداد",
  },
  description:
    "دوره‌های آموزشی تخصصی، ابزارهای تولید محتوا با هوش مصنوعی و بسته‌های پرامپت حرفه‌ای برای رشد کسب‌وکار شما در اینستاگرام.",
  keywords: [
    "دوره آموزشی آنلاین",
    "ابزار هوش مصنوعی",
    "بسته پرامپت",
    "تولید محتوا با AI",
    "آموزش اینستاگرام",
  ],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    title: "تیرداد | پلتفرم آموزش، ابزار هوش مصنوعی و رشد اینستاگرام",
    description:
      "دوره‌های آموزشی تخصصی، ابزارهای تولید محتوا با هوش مصنوعی و بسته‌های پرامپت حرفه‌ای برای رشد کسب‌وکار شما.",
    siteName: "تیرداد",
  },
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
