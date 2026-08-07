"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Info, RefreshCw, ShieldCheck, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { detectVpnProtocol } from "@/lib/vpn";

interface VpnConfigPanelProps {
  connected: boolean;
  maskedConfig: string | null;
}

type ProxyStatus = "stopped" | "starting" | "running" | "error";

const STATUS_LABEL: Record<ProxyStatus, string> = {
  stopped: "متوقف",
  starting: "در حال راه‌اندازی...",
  running: "فعال",
  error: "خطا",
};

const STATUS_VARIANT: Record<ProxyStatus, "success" | "warning" | "destructive" | "outline"> = {
  stopped: "outline",
  starting: "warning",
  running: "success",
  error: "destructive",
};

export function VpnConfigPanel({ connected, maskedConfig }: VpnConfigPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [status, setStatus] = useState<ProxyStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  async function fetchStatus() {
    setStatusLoading(true);
    try {
      const res = await fetch("/api/admin/vpn/status");
      const data = await res.json();
      if (res.ok) {
        setStatus(data.status);
        setStatusError(data.lastError);
      }
    } finally {
      setStatusLoading(false);
    }
  }

  useEffect(() => {
    if (!connected) return;
    let cancelled = false;
    (async () => {
      setStatusLoading(true);
      try {
        const res = await fetch("/api/admin/vpn/status");
        const data = await res.json();
        if (!cancelled && res.ok) {
          setStatus(data.status);
          setStatusError(data.lastError);
        }
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connected]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/settings/vpn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configUrl: formData.get("configUrl") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره کانفیگ");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره کانفیگ");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setLoading(true);
    try {
      await fetch("/api/admin/settings/vpn", { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-1 flex items-center gap-2">
        <ShieldCheck size={16} className="text-primary" />
        <h3 className="font-bold">VPN برای پیام‌رسان‌ها</h3>
      </div>
      <p className="mb-5 text-xs leading-6 text-muted-foreground">
        کانفیگ VLESS یا VMess برای رد کردن درخواست‌های تلگرام، بله و اینستاگرام از پشت این پراکسی (به‌خاطر
        فیلترینگ) — روی هیچ بخش دیگه‌ای از سایت (پیامک، پرداخت، آپلود و ...) اثر نمی‌ذاره.
      </p>

      <div className="mb-4 flex items-start gap-2 rounded-md border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>
          با ذخیره کانفیگ، سرور خودش باینری Xray-core رو (اگه نصب نباشه) دانلود و اجرا می‌کنه. واتساپ چون هنوز به
          صورت وب‌سرویس وصل نشده، فعلاً این پراکسی رو استفاده نمی‌کنه.
        </span>
      </div>

      {connected ? (
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status && <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>}
              <Button variant="ghost" size="sm" onClick={fetchStatus} disabled={statusLoading}>
                <RefreshCw size={12} className={statusLoading ? "animate-spin" : ""} />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={loading}>
              <Unlink size={14} />
              حذف
            </Button>
          </div>
          <p dir="ltr" className="break-all text-xs text-muted-foreground">
            {maskedConfig}
          </p>
          {statusError && <p className="mt-2 text-xs text-destructive">{statusError}</p>}
        </div>
      ) : (
        <form onSubmit={handleSave} className="rounded-lg border border-border p-4">
          <Label htmlFor="vpn-config">کانفیگ VLESS / VMess</Label>
          <Textarea
            id="vpn-config"
            name="configUrl"
            dir="ltr"
            rows={3}
            placeholder="vless://... یا vmess://..."
            required
            onChange={(e) => setProtocol(detectVpnProtocol(e.target.value.trim()))}
          />
          {protocol && (
            <p className="mt-1 text-xs text-muted-foreground">پروتکل شناسایی‌شده: {protocol}</p>
          )}
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <Button type="submit" size="sm" className="mt-3" disabled={loading}>
            {loading ? "در حال ذخیره و راه‌اندازی..." : "ذخیره و اتصال"}
          </Button>
        </form>
      )}
    </div>
  );
}
