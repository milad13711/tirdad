"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

// Ticks down to `endsAt` (ISO string, computed server-side per visitor —
// see src/lib/pricing.ts). Renders nothing once it hits zero; the actual
// price reverting happens server-side on the next page load/checkout, this
// is purely the urgency UI.
export function SaleCountdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState(() => new Date(endsAt).getTime() - Date.now());

  useEffect(() => {
    const target = new Date(endsAt).getTime();
    const interval = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (remaining <= 0) return null;

  return (
    <div className="mt-2 flex w-fit items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive">
      <Flame size={14} />
      <span>این تخفیف تا</span>
      <span dir="ltr" className="font-mono tabular-nums">
        {formatRemaining(remaining)}
      </span>
      <span>دیگر فعال است</span>
    </div>
  );
}
