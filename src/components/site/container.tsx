import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-6 md:px-10", className)}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-3 text-sm font-semibold tracking-wide text-primary">
      <span className="h-px w-8 bg-primary" />
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-balance text-3xl font-extrabold leading-tight tracking-tight md:text-5xl",
        className,
      )}
    >
      {children}
    </h2>
  );
}
