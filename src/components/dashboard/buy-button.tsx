"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type PurchasePayload =
  | { itemType: "COURSE"; courseId: string }
  | { itemType: "SUBSCRIPTION"; planId: string };

export function BuyButton({
  payload,
  children,
  ...buttonProps
}: {
  payload: PurchasePayload;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Button>, "onClick">) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/payments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در اتصال به درگاه پرداخت");
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در اتصال به درگاه پرداخت");
      setLoading(false);
    }
  }

  return (
    <div>
      <Button {...buttonProps} onClick={handleClick} disabled={loading}>
        {loading ? "در حال اتصال به درگاه..." : children}
      </Button>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
