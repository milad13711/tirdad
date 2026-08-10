"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Sparkles, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

export function Sidebar({
  items,
  title,
  onNavigate,
  className,
}: {
  items: NavItem[];
  title: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className={cn("flex h-full w-64 flex-col border-l border-border bg-card", className)}>
      <div className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5 text-base font-extrabold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_2px_8px_rgba(26,127,255,0.35)]">
            <Sparkles size={16} />
          </span>
          تیرداد
        </Link>
        <button
          type="button"
          onClick={onNavigate}
          aria-label="بستن منو"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <p className="px-6 pb-2 text-xs font-medium tracking-wide text-muted-foreground/80">{title}</p>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute inset-y-1.5 right-0 w-0.5 rounded-full bg-primary" aria-hidden />
              )}
              <span className={cn("transition-transform duration-200", active && "scale-110")}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={17} />
          خروج از حساب
        </button>
      </div>
    </aside>
  );
}
