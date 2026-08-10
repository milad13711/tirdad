"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Send, Unlink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Connection {
  provider: "TELEGRAM" | "BALE";
  botUsername: string | null;
  connectedAt: Date | null;
  lastPollError: string | null;
}

interface WhatsAppConnection {
  botUsername: string | null;
  connectedAt: Date | null;
  phoneNumberId: string | null;
}

const PROVIDER_META: Record<
  "TELEGRAM" | "BALE",
  { label: string; guide: string }
> = {
  TELEGRAM: {
    label: "تلگرام",
    guide: "از @BotFather در تلگرام یک ربات بساز و توکنش رو اینجا وارد کن.",
  },
  BALE: {
    label: "بله",
    guide: "از پنل توسعه‌دهندگان بله یک ربات بساز و توکنش رو اینجا وارد کن.",
  },
};

function ConnectionCard({ connection }: { connection: Connection }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const meta = PROVIDER_META[connection.provider];

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/messengers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: connection.provider, token: formData.get("token") }),
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
    try {
      await fetch(`/api/admin/messengers?provider=${connection.provider}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (connection.connectedAt) {
    return (
      <div className="rounded-lg border border-border p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold">{meta.label}</span>
            <Badge variant="success" className="ms-2">
              متصل
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={loading}>
            <Unlink size={14} />
            قطع اتصال
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">ربات: @{connection.botUsername}</p>
        {connection.lastPollError && (
          <p className="mt-1 text-xs text-destructive">آخرین خطای دریافت پیام: {connection.lastPollError}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleConnect} className="rounded-lg border border-border p-4">
      <div className="mb-2 text-sm font-semibold">{meta.label}</div>
      <p className="mb-3 text-xs leading-6 text-muted-foreground">{meta.guide}</p>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1">
          <Label htmlFor={`msg-token-${connection.provider}`}>توکن ربات</Label>
          <Input id={`msg-token-${connection.provider}`} name="token" dir="ltr" type="password" required />
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "در حال اتصال..." : "اتصال"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </form>
  );
}

function WhatsAppCard({ connection }: { connection: WhatsAppConnection }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/whatsapp` : "";

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/messengers/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: formData.get("token"),
          phoneNumberId: formData.get("phoneNumberId"),
          verifyToken: formData.get("verifyToken"),
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
    try {
      await fetch("/api/admin/messengers/whatsapp", { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function copyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (connection.connectedAt) {
    return (
      <div className="rounded-lg border border-border p-4 sm:col-span-2">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold">واتساپ</span>
            <Badge variant="success" className="ms-2">
              متصل
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={loading}>
            <Unlink size={14} />
            قطع اتصال
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">شماره: {connection.botUsername}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          پیام‌های ورودی مستقیم و آنی از طریق وب‌هوک دریافت می‌شن (بدون تاخیر استعلام دوره‌ای).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleConnect} className="rounded-lg border border-border p-4 sm:col-span-2">
      <div className="mb-2 text-sm font-semibold">واتساپ</div>
      <p className="mb-3 text-xs leading-6 text-muted-foreground">
        از پنل{" "}
        <a
          href="https://developers.facebook.com/apps"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          Meta for Developers
        </a>{" "}
        یک اپ WhatsApp Business بساز، Phone Number ID و یک Access Token دائمی بگیر، یک Verify Token دلخواه انتخاب کن،
        و آدرس وب‌هوک زیر رو در تنظیمات وب‌هوک اپ (همراه با همون Verify Token) ثبت کن:
      </p>
      <div className="mb-3 flex items-center gap-2 rounded-md bg-secondary/60 px-3 py-2">
        <code dir="ltr" className="flex-1 truncate text-xs">
          {webhookUrl}
        </code>
        <button type="button" onClick={copyWebhookUrl} className="text-muted-foreground hover:text-foreground">
          <Copy size={13} />
        </button>
        {copied && <span className="text-[10px] text-primary">کپی شد</span>}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <Label htmlFor="wa-phone-id">Phone Number ID</Label>
          <Input id="wa-phone-id" name="phoneNumberId" dir="ltr" required />
        </div>
        <div>
          <Label htmlFor="wa-token">Access Token</Label>
          <Input id="wa-token" name="token" dir="ltr" type="password" required />
        </div>
        <div>
          <Label htmlFor="wa-verify-token">Verify Token</Label>
          <Input id="wa-verify-token" name="verifyToken" dir="ltr" required />
        </div>
      </div>
      <Button type="submit" size="sm" disabled={loading} className="mt-3">
        {loading ? "در حال اتصال..." : "اتصال"}
      </Button>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </form>
  );
}

export function MessengerConnectionPanel({
  connections,
  whatsapp,
}: {
  connections: Connection[];
  whatsapp: WhatsAppConnection;
}) {
  const byProvider = new Map(connections.map((c) => [c.provider, c]));
  const telegram = byProvider.get("TELEGRAM") ?? { provider: "TELEGRAM" as const, botUsername: null, connectedAt: null, lastPollError: null };
  const bale = byProvider.get("BALE") ?? { provider: "BALE" as const, botUsername: null, connectedAt: null, lastPollError: null };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-1 font-bold">پیام‌رسان‌ها</h3>
      <p className="mb-5 text-xs text-muted-foreground">
        پیام‌های ورودی این پیام‌رسان‌ها هر ۵ ثانیه دریافت و توی «صندوق پیام» آرشیو می‌شن.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <ConnectionCard connection={telegram} />
        <ConnectionCard connection={bale} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <div className="mb-1 text-sm font-semibold">دایرکت اینستاگرام</div>
          <p className="text-xs leading-6 text-muted-foreground">
            از همون فرم اتصال اینستاگرام توی{" "}
            <Link href="/admin/engagement" className="text-primary hover:underline">
              صفحه ارتباط با مخاطب (تب CRM اینستاگرام)
            </Link>{" "}
            وصل کن (Access Token + Business Account ID با دسترسی instagram_manage_messages) — بعد از اتصال، دایرکت‌ها
            هر ۳۰ ثانیه توی همین صندوق پیام هم آرشیو می‌شن و می‌تونی از همینجا جواب بدی.
          </p>
        </div>

        <WhatsAppCard connection={whatsapp} />
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Send size={12} />
        تلگرام و بله هر ۵ ثانیه و اینستاگرام هر ۳۰ ثانیه استعلام می‌شن. واتساپ استعلام دوره‌ای نداره — پیام‌ها آنی و
        مستقیم از طریق وب‌هوک دریافت می‌شن.
      </p>
    </div>
  );
}
