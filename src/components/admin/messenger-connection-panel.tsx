"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Send, Unlink } from "lucide-react";
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

export function MessengerConnectionPanel({ connections }: { connections: Connection[] }) {
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
            <Link href="/admin/crm" className="text-primary hover:underline">
              صفحه CRM اینستاگرام
            </Link>{" "}
            وصل کن (Access Token + Business Account ID با دسترسی instagram_manage_messages) — بعد از اتصال، دایرکت‌ها
            هر ۳۰ ثانیه توی همین صندوق پیام هم آرشیو می‌شن و می‌تونی از همینجا جواب بدی.
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-border p-4">
          <div className="mb-1 text-sm font-semibold text-muted-foreground">واتساپ</div>
          <p className="text-xs leading-6 text-muted-foreground">
            برخلاف تلگرام/بله/اینستاگرام، WhatsApp Cloud API فقط وب‌هوک پشتیبانی می‌کنه و جایگزین استعلام دوره‌ای
            نداره؛ یعنی بدون دامنه و SSL واقعی روی سایت، پیام ورودی واتساپ اصلاً قابل دریافت نیست. بعد از راه‌اندازی
            دامنه، این بخش هم تکمیل می‌شه.
          </p>
        </div>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Send size={12} />
        چون سایت هنوز دامنه و SSL نداره، پیام‌ها با وب‌هوک دریافت نمی‌شن — به‌جاش هر ۵ ثانیه از تلگرام/بله و هر ۳۰
        ثانیه از اینستاگرام استعلام گرفته می‌شه؛ بعد از اتصال دامنه می‌شه به وب‌هوک آنی سوییچ کرد.
      </p>
    </div>
  );
}
