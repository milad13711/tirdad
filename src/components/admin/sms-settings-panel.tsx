"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { MessageSquareText, Send, Unlink, RefreshCw, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { SMS_TRIGGER_EVENTS } from "@/lib/sms/event-keys";

interface SmsSettingsPanelProps {
  connected: boolean;
  senderNumber: string | null;
  maskedApiKey: string | null;
  triggers: {
    id: string;
    name: string;
    eventKey: string;
    message: string;
    active: boolean;
  }[];
}

function eventLabel(key: string) {
  return SMS_TRIGGER_EVENTS.find((e) => e.key === key)?.label ?? key;
}

export function SmsSettingsPanel({
  connected,
  senderNumber,
  maskedApiKey,
  triggers,
}: SmsSettingsPanelProps) {
  const [tab, setTab] = useState<"connect" | "triggers">("connect");

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center gap-2">
        <MessageSquareText size={16} className="text-primary" />
        <h3 className="font-bold">پیامک</h3>
      </div>

      <div className="mb-6 flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("connect")}
          className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
            tab === "connect"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          اتصال و پیامک تستی
        </button>
        <button
          type="button"
          onClick={() => setTab("triggers")}
          className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
            tab === "triggers"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          تریگرهای پیامکی
        </button>
      </div>

      {tab === "connect" ? (
        <ConnectTab connected={connected} senderNumber={senderNumber} maskedApiKey={maskedApiKey} />
      ) : (
        <TriggersTab triggers={triggers} />
      )}
    </div>
  );
}

function ConnectTab({
  connected,
  senderNumber,
  maskedApiKey,
}: {
  connected: boolean;
  senderNumber: string | null;
  maskedApiKey: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credit, setCredit] = useState<unknown>(null);
  const [creditLoading, setCreditLoading] = useState(false);
  const [creditError, setCreditError] = useState<string | null>(null);

  async function fetchCredit() {
    setCreditLoading(true);
    setCreditError(null);
    try {
      const res = await fetch("/api/admin/sms/credit");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در دریافت موجودی");
      setCredit(data.credit);
    } catch (err) {
      setCreditError(err instanceof Error ? err.message : "خطا در دریافت موجودی");
    } finally {
      setCreditLoading(false);
    }
  }

  useEffect(() => {
    if (!connected) return;
    let cancelled = false;
    (async () => {
      setCreditLoading(true);
      setCreditError(null);
      try {
        const res = await fetch("/api/admin/sms/credit");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "خطا در دریافت موجودی");
        if (!cancelled) setCredit(data.credit);
      } catch (err) {
        if (!cancelled) {
          setCreditError(err instanceof Error ? err.message : "خطا در دریافت موجودی");
        }
      } finally {
        if (!cancelled) setCreditLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connected]);

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/settings/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: formData.get("apiKey"),
          senderNumber: formData.get("senderNumber"),
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
      await fetch("/api/admin/settings/sms", { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const creditEntries =
    credit && typeof credit === "object" && !Array.isArray(credit)
      ? Object.entries(credit as Record<string, unknown>)
      : null;

  return (
    <div className="space-y-6">
      {connected ? (
        <div className="rounded-lg border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="success">متصل به لیمو اس‌ام‌اس</Badge>
            <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={loading}>
              <Unlink size={14} />
              قطع اتصال
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            شماره ارسال‌کننده: <span dir="ltr">{senderNumber}</span> · توکن: <span dir="ltr">{maskedApiKey}</span>
          </p>

          <div className="mt-4 rounded-md bg-secondary/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">موجودی و تعرفه</span>
              <Button variant="ghost" size="sm" onClick={fetchCredit} disabled={creditLoading}>
                <RefreshCw size={12} className={creditLoading ? "animate-spin" : ""} />
                بروزرسانی
              </Button>
            </div>
            {creditError && <p className="text-xs text-destructive">{creditError}</p>}
            {creditEntries && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {creditEntries.map(([key, value]) => (
                  <div key={key} className="contents">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd dir="ltr" className="text-left font-mono">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <a
              href="https://panel.limosms.com"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Zap size={12} />
              شارژ پنل در سایت لیمو اس‌ام‌اس
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConnect} className="rounded-lg border border-border p-4">
          <p className="mb-4 text-xs leading-6 text-muted-foreground">
            توکن (ApiKey) پنل لیمو اس‌ام‌اس را از بخش وب‌سرویس پنل کاربری‌ات بردار و همراه شماره
            خط ارسال‌کننده وارد کن.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="sms-api-key">توکن پنل (ApiKey)</Label>
              <Input id="sms-api-key" name="apiKey" type="password" dir="ltr" required />
            </div>
            <div>
              <Label htmlFor="sms-sender">شماره ارسال‌کننده</Label>
              <Input id="sms-sender" name="senderNumber" dir="ltr" required />
            </div>
          </div>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <Button type="submit" size="sm" className="mt-4" disabled={loading}>
            {loading ? "در حال اتصال..." : "اتصال"}
          </Button>
        </form>
      )}

      {connected && <TestSmsBox />}
    </div>
  );
}

function TestSmsBox() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/sms/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: formData.get("mobile"),
          message: formData.get("message"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ارسال ناموفق بود");
      setResult("پیامک تستی ارسال شد");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال ناموفق بود");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSend} className="rounded-lg border border-border p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Send size={14} className="text-primary" />
        ارسال پیامک تستی
      </div>
      <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
        <Input name="mobile" dir="ltr" placeholder="09xxxxxxxxx" required />
        <Input name="message" placeholder="متن پیامک تستی" required />
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {result && <p className="mt-2 text-xs text-primary">{result}</p>}
      <Button type="submit" size="sm" className="mt-3" disabled={loading}>
        {loading ? "در حال ارسال..." : "ارسال تستی"}
      </Button>
    </form>
  );
}

function TriggersTab({
  triggers,
}: {
  triggers: { id: string; name: string; eventKey: string; message: string; active: boolean }[];
}) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      {triggers.length === 0 && !creating && (
        <p className="text-sm text-muted-foreground">هنوز تریگری ایجاد نشده است.</p>
      )}

      {triggers.map((trigger) => (
        <TriggerRow key={trigger.id} trigger={trigger} />
      ))}

      {creating ? (
        <NewTriggerForm onDone={() => setCreating(false)} />
      ) : (
        <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
          <Plus size={14} />
          ایجاد تریگر جدید
        </Button>
      )}
    </div>
  );
}

function TriggerRow({
  trigger,
}: {
  trigger: { id: string; name: string; eventKey: string; message: string; active: boolean };
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{trigger.name}</span>
            <Badge variant={trigger.active ? "success" : "outline"}>
              {trigger.active ? "فعال" : "غیرفعال"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{eventLabel(trigger.eventKey)}</p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleStatusButton
            endpoint="/api/admin/sms/triggers"
            body={{ id: trigger.id, active: !trigger.active }}
            activeNow={trigger.active}
            onLabel="فعال‌سازی"
            offLabel="غیرفعال‌سازی"
          />
          <DeleteButton
            endpoint="/api/admin/sms/triggers"
            id={trigger.id}
            confirmMessage={`تریگر «${trigger.name}» حذف شود؟`}
          />
        </div>
      </div>
      <p className="whitespace-pre-wrap rounded-md bg-secondary/40 p-2 text-xs text-muted-foreground">
        {trigger.message}
      </p>
    </div>
  );
}

function NewTriggerForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventKey, setEventKey] = useState<string>(SMS_TRIGGER_EVENTS[0].key);
  const [customEvent, setCustomEvent] = useState(false);

  const activeVars = SMS_TRIGGER_EVENTS.find((e) => e.key === eventKey)?.vars ?? [];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/sms/triggers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          eventKey: customEvent ? formData.get("customEventKey") : eventKey,
          message: formData.get("message"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ایجاد تریگر");
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ایجاد تریگر");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4">
      <div className="mb-3 text-sm font-semibold">تریگر جدید</div>
      <div className="space-y-3">
        <div>
          <Label htmlFor="trigger-name">نام تریگر</Label>
          <Input id="trigger-name" name="name" placeholder="مثال: پیامک خوش‌آمدگویی خرید" required />
        </div>
        <div>
          <Label htmlFor="trigger-event">رویداد</Label>
          <select
            id="trigger-event"
            className="h-11 w-full rounded-md border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
            value={customEvent ? "__custom" : eventKey}
            onChange={(e) => {
              if (e.target.value === "__custom") {
                setCustomEvent(true);
              } else {
                setCustomEvent(false);
                setEventKey(e.target.value);
              }
            }}
          >
            {SMS_TRIGGER_EVENTS.map((e) => (
              <option key={e.key} value={e.key}>
                {e.label}
              </option>
            ))}
            <option value="__custom">سناریوی سفارشی...</option>
          </select>
        </div>
        {customEvent && (
          <div>
            <Label htmlFor="trigger-custom-key">کلید رویداد سفارشی</Label>
            <Input id="trigger-custom-key" name="customEventKey" dir="ltr" placeholder="CUSTOM_EVENT" required />
          </div>
        )}
        <div>
          <Label htmlFor="trigger-message">متن پیامک</Label>
          <Textarea id="trigger-message" name="message" rows={3} required />
          {!customEvent && activeVars.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              متغیرهای قابل استفاده: {activeVars.map((v) => `{{${v}}}`).join("، ")}
            </p>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "در حال ذخیره..." : "ایجاد تریگر"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          انصراف
        </Button>
      </div>
    </form>
  );
}
