"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AtSign, RefreshCw, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatJalali } from "@/lib/format";

interface InstagramConnectionCardProps {
  connectedAt: Date | null;
  businessAccountId: string | null;
  lastSyncAt: Date | null;
  lastSyncError: string | null;
}

export function InstagramConnectionCard({
  connectedAt,
  businessAccountId,
  lastSyncAt,
  lastSyncError,
}: InstagramConnectionCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: formData.get("accessToken"),
          businessAccountId: formData.get("businessAccountId"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در اتصال");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در اتصال");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/admin/instagram", { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setLoading(true);
    setError(null);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/instagram/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در همگام‌سازی");
      setSyncResult(`${data.created} لید جدید از ${data.total} مکالمه ثبت شد`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در همگام‌سازی");
    } finally {
      setLoading(false);
    }
  }

  if (connectedAt) {
    return (
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AtSign size={16} className="text-primary" />
            اکانت اینستاگرام متصل است
          </div>
          <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={loading}>
            <Unlink size={14} />
            قطع اتصال
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          شناسه اکانت: {businessAccountId} · اتصال: {formatJalali(connectedAt)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          آخرین همگام‌سازی: {lastSyncAt ? formatJalali(lastSyncAt) : "هنوز انجام نشده"}
        </p>
        {lastSyncError && <p className="mt-1 text-xs text-destructive">خطای آخرین تلاش: {lastSyncError}</p>}
        {syncResult && <p className="mt-1 text-xs text-primary">{syncResult}</p>}
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        <Button size="sm" className="mt-3" onClick={handleSync} disabled={loading}>
          <RefreshCw size={14} />
          {loading ? "در حال دریافت..." : "دریافت اطلاعات از اینستاگرام"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleConnect} className="mb-6 rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <AtSign size={16} className="text-primary" />
        اتصال اکانت اینستاگرام
      </div>
      <p className="mb-4 text-xs leading-6 text-muted-foreground">
        برای دریافت خودکار دایرکت‌ها، یک اکانت بیزینس اینستاگرام از طریق Meta Business Suite تنظیم
        کن، یک Long-Lived Access Token با دسترسی instagram_manage_messages از Graph API Explorer
        بگیر و همراه با شناسه اکانت بیزینس (Instagram Business Account ID) اینجا وارد کن.
      </p>
      <div className="space-y-3">
        <div>
          <Label htmlFor="ig-token">Access Token</Label>
          <Input id="ig-token" name="accessToken" type="password" required />
        </div>
        <div>
          <Label htmlFor="ig-business-id">Instagram Business Account ID</Label>
          <Input id="ig-business-id" name="businessAccountId" required />
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <Button type="submit" size="sm" className="mt-4" disabled={loading}>
        {loading ? "در حال اتصال..." : "اتصال"}
      </Button>
    </form>
  );
}
