"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Home,
  LogIn,
  MoreHorizontal,
  Package,
  ScanSearch,
  Sparkles,
  X,
} from "lucide-react";
import { navLinks } from "@/lib/content";
import { cn } from "@/lib/utils";

// The five most important funnel steps get their own icon+label tab —
// anything else (pricing, blog, login) lives behind "بیشتر" so the bar
// never has to cram more than 6 items into one row on a small screen.
const primaryTabs = [
  { label: "خانه", href: "/", icon: Home },
  { label: "پرامپت رایگان", href: "/#ai-tools", icon: Sparkles },
  { label: "دوره‌ها", href: "/#courses", icon: GraduationCap },
  { label: "آنالیز پیج", href: "/#page-analysis", icon: ScanSearch },
  { label: "ابزارها", href: "/#tools", icon: Package },
] as const;

export function MobileBottomNav({
  showPricing = true,
  siteTitle = "تیرداد",
}: {
  showPricing?: boolean;
  siteTitle?: string;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreLinks = showPricing ? navLinks : navLinks.filter((link) => link.href !== "/#pricing");

  useEffect(() => {
    document.body.style.overflow = moreOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  return (
    <>
      {/* Spacer so fixed-position content below doesn't sit under the bar. */}
      <div className="h-16 md:hidden" aria-hidden />

      {moreOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 md:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[70] rounded-t-2xl border-t border-border bg-background transition-transform duration-300 md:hidden",
          moreOpen ? "translate-y-0" : "translate-y-full",
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="text-sm font-bold">منوی {siteTitle}</span>
          <button
            type="button"
            onClick={() => setMoreOpen(false)}
            aria-label="بستن منو"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {moreLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMoreOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 border-t border-border p-4">
          <Link
            href="/login"
            onClick={() => setMoreOpen(false)}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border py-2.5 text-sm font-medium"
          >
            <LogIn size={15} />
            ورود
          </Link>
          <Link
            href="/login"
            onClick={() => setMoreOpen(false)}
            className="flex flex-1 items-center justify-center rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground"
          >
            شروع رایگان
          </Link>
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="منوی اصلی"
      >
        <div className="grid grid-cols-6">
          {primaryTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 py-2.5 text-muted-foreground transition-colors active:text-primary"
            >
              <tab.icon size={19} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-1 py-2.5 text-muted-foreground transition-colors active:text-primary"
          >
            <MoreHorizontal size={19} />
            <span className="text-[10px] font-medium">بیشتر</span>
          </button>
        </div>
      </nav>
    </>
  );
}
