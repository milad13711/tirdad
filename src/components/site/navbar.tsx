"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Container } from "@/components/site/container";
import { navLinks } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
        <a href="#home" className="flex items-center gap-2 text-lg font-extrabold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles size={16} />
          </span>
          تیرداد
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">ورود</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/login">شروع رایگان</Link>
          </Button>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="باز کردن منو"
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </Container>

      {open && (
        <div className="absolute inset-x-0 top-full h-[calc(100vh-100%)] overflow-y-auto border-t border-border bg-background px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href="/login" onClick={() => setOpen(false)}>
                ورود
              </Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link href="/login" onClick={() => setOpen(false)}>
                شروع رایگان
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
