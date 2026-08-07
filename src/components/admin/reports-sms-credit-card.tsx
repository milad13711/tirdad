"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportsSmsCreditCard({ connected }: { connected: boolean }) {
  const [credit, setCredit] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCredit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sms/credit");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در دریافت موجودی");
      setCredit(typeof data.credit === "object" && data.credit !== null ? data.credit : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت موجودی");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!connected) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/sms/credit");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "خطا در دریافت موجودی");
        if (!cancelled) setCredit(typeof data.credit === "object" && data.credit !== null ? data.credit : null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "خطا در دریافت موجودی");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connected]);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">موجودی پنل پیامکی</span>
        {connected && (
          <Button variant="ghost" size="sm" onClick={fetchCredit} disabled={loading}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </Button>
        )}
      </div>

      {!connected ? (
        <p className="text-xs text-muted-foreground">پنل پیامکی متصل نیست — از تنظیمات سایت وصل کن.</p>
      ) : error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : credit ? (
        <dl className="space-y-1 text-xs">
          {Object.entries(credit).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <dt className="text-muted-foreground">{key}</dt>
              <dd dir="ltr" className="font-mono">
                {String(value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-xs text-muted-foreground">در حال دریافت...</p>
      )}

      {connected && (
        <a
          href="https://panel.limosms.com"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <Zap size={12} />
          شارژ مجدد در پنل لیمو اس‌ام‌اس
        </a>
      )}
    </div>
  );
}
