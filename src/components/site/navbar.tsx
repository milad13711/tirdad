"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Container } from "@/components/site/container";
import { SiteLogo } from "@/components/site/site-logo";
import { NotificationBell } from "@/components/site/notification-bell";
import { navLinks } from "@/lib/content";
import { cn } from "@/lib/utils";

// Mobile navigation lives in <MobileBottomNav> (fixed bottom bar) instead of
// a hamburger dropdown here — this header only handles desktop nav on md+,
// plus the logo and theme toggle on every screen size.
export function Navbar({
  showPricing = true,
  siteTitle = "تیرداد",
  logoUrl = "",
}: {
  showPricing?: boolean;
  siteTitle?: string;
  logoUrl?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const links = showPricing ? navLinks : navLinks.filter((link) => link.href !== "/#pricing");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "bg-gradient-to-b from-background/90 to-transparent",
      )}
    >
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
          <SiteLogo logoUrl={logoUrl} siteTitle={siteTitle} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <NotificationBell />
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">ورود</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/login">شروع رایگان</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
