"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SEGMENTS, type SegmentKey } from "@/lib/marketing-segments";

interface Contact {
  phone: string;
  name: string | null;
  userId: string | null;
  segments: SegmentKey[];
  hasWebPush: boolean;
}

type Channel = "PUSH" | "SMS" | "WHATSAPP";

const CHANNELS: { key: Channel; label: string }[] = [
  { key: "PUSH", label: "اعلان (Push)" },
  { key: "SMS", label: "پیامک" },
  { key: "WHATSAPP", label: "واتساپ (دستی)" },
];

const DISABLED_CHANNELS = [
  { label: "تلگرام", note: "بعد از اتصال ربات فعال می‌شود" },
  { label: "بله", note: "بعد از اتصال ربات فعال می‌شود" },
  { label: "دایرکت اینستاگرام", note: "بعد از اتصال اکانت فعال می‌شود" },
];

export function MarketingPanel({ contacts }: { contacts: Contact[] }) {
  const [selectedSegments, setSelectedSegments] = useState<SegmentKey[]>([]);
  const [channel, setChannel] = useState<Channel>("PUSH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    sent?: number;
    links?: { phone: string; name: string | null; url: string }[];
  } | null>(null);

  const matched = useMemo(
    () =>
      selectedSegments.length === 0
        ? []
        : contacts.filter((c) => c.segments.some((s) => selectedSegments.includes(s))),
    [contacts, selectedSegments],
  );

  const matchedForChannel = useMemo(() => {
    if (channel === "PUSH") return matched.filter((c) => c.hasWebPush);
    return matched;
  }, [matched, channel]);

  function toggleSegment(key: SegmentKey) {
    setSelectedSegments((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/marketing/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments: selectedSegments,
          channel,
          message: formData.get("message"),
          title: formData.get("title") || undefined,
          linkPath: formData.get("linkPath") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ارسال ناموفق بود");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال ناموفق بود");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-5 font-bold">فیلتر مخاطبان و ارسال کمپین</h3>

      <div className="mb-6">
        <Label className="mb-2 block">مخاطبان براساس رفتار</Label>
        <div className="flex flex-wrap gap-2">
          {SEGMENTS.map((segment) => {
            const active = selectedSegments.includes(segment.key);
            const count = contacts.filter((c) => c.segments.includes(segment.key)).length;
            return (
              <button
                key={segment.key}
                type="button"
                onClick={() => toggleSegment(segment.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {segment.label} ({count.toLocaleString("fa-IR")})
              </button>
            );
          })}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users size={13} />
          {selectedSegments.length === 0
            ? "برای دیدن مخاطبان، حداقل یک فیلتر را انتخاب کن"
            : `${matched.length.toLocaleString("fa-IR")} مخاطب مطابق فیلتر (تجمیع‌شده براساس شماره موبایل)`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="mb-2 block">کانال ارسال</Label>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setChannel(c.key)}
                className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                  channel === c.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {c.label}
              </button>
            ))}
            {DISABLED_CHANNELS.map((c) => (
              <span
                key={c.label}
                title={c.note}
                className="cursor-not-allowed rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground/60"
              >
                {c.label}
              </span>
            ))}
          </div>
          {selectedSegments.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {channel === "PUSH"
                ? `${matchedForChannel.length.toLocaleString("fa-IR")} نفر از مخاطبان انتخابی وب‌اپ نصب دارند`
                : `${matchedForChannel.length.toLocaleString("fa-IR")} نفر دریافت می‌کنند`}
            </p>
          )}
        </div>

        {channel === "PUSH" && (
          <div>
            <Label htmlFor="mkt-title">عنوان اعلان</Label>
            <Input id="mkt-title" name="title" placeholder="مثال: تخفیف ویژه امروز" />
          </div>
        )}

        <div>
          <Label htmlFor="mkt-message">متن پیام</Label>
          <Textarea id="mkt-message" name="message" rows={3} required />
        </div>

        <div>
          <Label htmlFor="mkt-link">لینک مقصد (اختیاری — برای اندازه‌گیری نرخ کلیک)</Label>
          <Input id="mkt-link" name="linkPath" dir="ltr" placeholder="/prompts" />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="rounded-md bg-secondary/40 p-3 text-sm">
            {result.links ? (
              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  چون هنوز API واتساپ وصل نشده، این لینک‌ها رو برای ارسال دستی باز کن:
                </p>
                <ul className="max-h-48 space-y-1 overflow-y-auto text-xs">
                  {result.links.map((link) => (
                    <li key={link.phone} className="flex items-center justify-between gap-2">
                      <span dir="ltr">{link.phone}</span>
                      <a href={link.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        باز کردن در واتساپ
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-primary">پیام برای {(result.sent ?? 0).toLocaleString("fa-IR")} نفر ارسال شد</p>
            )}
          </div>
        )}

        <Button type="submit" disabled={loading || selectedSegments.length === 0}>
          {loading ? "در حال ارسال..." : <><Send size={16} /> ارسال کمپین</>}
        </Button>
        {selectedSegments.length > 0 && matchedForChannel.length === 0 && (
          <Badge variant="warning" className="ms-3">
            با این فیلتر و کانال، مخاطبی برای ارسال وجود ندارد
          </Badge>
        )}
      </form>
    </div>
  );
}
