import Link from "next/link";
import { AtSign, Send, PlaySquare } from "lucide-react";
import { Container } from "@/components/site/container";
import { SiteLogo } from "@/components/site/site-logo";
import { navLinks } from "@/lib/content";

const socials = [
  { icon: AtSign, href: "https://instagram.com", label: "اینستاگرام" },
  { icon: Send, href: "https://t.me", label: "تلگرام" },
  { icon: PlaySquare, href: "https://youtube.com", label: "یوتیوب" },
];

export function Footer({
  siteTitle = "تیرداد",
  logoUrl = "",
}: {
  siteTitle?: string;
  logoUrl?: string;
}) {
  return (
    <footer className="border-t border-border py-16">
      <Container>
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Link href="/" className="flex w-fit items-center gap-2 text-lg font-extrabold">
              <SiteLogo logoUrl={logoUrl} siteTitle={siteTitle} />
            </Link>
            <p className="mt-4 max-w-xs leading-7 text-muted-foreground">
              پلتفرم آموزش، ابزارهای هوش مصنوعی و رشد کسب‌وکار در اینستاگرام.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">لینک‌های سریع</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">ما را دنبال کنید</h4>
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© ۱۴۰۴ تیرداد. تمامی حقوق محفوظ است.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-foreground">
              حریم خصوصی
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              قوانین و مقررات
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
