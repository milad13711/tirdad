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
    default: "تیرداد | پرامپت‌های رایگان هوش مصنوعی و پکیج‌های آموزشی",
    template: "%s | تیرداد",
  },
  description:
    "پرامپت‌های رایگان تولید عکس و فیلم با هوش مصنوعی، پکیج‌های آموزشی تخصصی و خدمات طراحی سفارشی برای رشد کسب‌وکار شما در اینستاگرام.",
  keywords: [
    "پرامپت رایگان هوش مصنوعی",
    "پکیج آموزشی آنلاین",
    "تولید محتوا با AI",
    "طراحی تیزر و تصویر",
    "آموزش اینستاگرام",
  ],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    title: "تیرداد | پرامپت‌های رایگان هوش مصنوعی و پکیج‌های آموزشی",
    description:
      "پرامپت‌های رایگان تولید عکس و فیلم با هوش مصنوعی، پکیج‌های آموزشی تخصصی و خدمات طراحی سفارشی برای رشد کسب‌وکار شما.",
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
