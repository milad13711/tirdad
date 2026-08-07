"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AlertTriangle, ShieldCheck, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { detectVpnProtocol } from "@/lib/vpn";

interface VpnConfigPanelProps {
  connected: boolean;
  maskedConfig: string | null;
}

export function VpnConfigPanel({ connected, maskedConfig }: VpnConfigPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<string | null>(null);

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
        کانفیگ VLESS یا VMess برای رد کردن درخواست‌های تلگرام، اینستاگرام و واتساپ از پشت این پراکسی (به‌خاطر
        فیلترینگ).
      </p>

      <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-500">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <span>
          فعلاً این کانفیگ فقط ذخیره می‌شه و به ترافیک واقعی وصل نیست — وصل کردنش به یک پراکسی واقعی (اجرای
          xray-core روی سرور) یک تغییر زیرساختی جداست که با تایید تو انجام می‌شه.
        </span>
      </div>

      {connected ? (
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="success">کانفیگ ذخیره شده</Badge>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={loading}>
              <Unlink size={14} />
              حذف
            </Button>
          </div>
          <p dir="ltr" className="break-all text-xs text-muted-foreground">
            {maskedConfig}
          </p>
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
            {loading ? "در حال ذخیره..." : "ذخیره کانفیگ"}
          </Button>
        </form>
      )}
    </div>
  );
}
