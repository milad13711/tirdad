"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
