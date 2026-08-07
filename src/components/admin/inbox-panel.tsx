"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatJalali } from "@/lib/format";

type Provider = "TELEGRAM" | "BALE" | "INSTAGRAM";

interface InboxMessage {
  id: string;
  provider: Provider;
  externalId: string;
  senderName: string | null;
  senderHandle: string | null;
  direction: "IN" | "OUT";
  text: string;
  createdAt: Date;
}

const PROVIDER_ICON: Record<Provider, string> = {
  TELEGRAM: "✈️",
  BALE: "🔵",
  INSTAGRAM: "📸",
};

const PROVIDER_LABEL: Record<Provider, string> = {
  TELEGRAM: "تلگرام",
  BALE: "بله",
  INSTAGRAM: "اینستاگرام",
};

export function InboxPanel({ messages }: { messages: InboxMessage[] }) {
  const threads = useMemo(() => {
    const byKey = new Map<string, InboxMessage[]>();
    for (const m of messages) {
      const key = `${m.provider}:${m.externalId}`;
      const arr = byKey.get(key) ?? [];
      arr.push(m);
      byKey.set(key, arr);
    }
    return [...byKey.entries()]
      .map(([key, msgs]) => {
        const sorted = [...msgs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        const last = sorted[sorted.length - 1];
        return { key, provider: last.provider, externalId: last.externalId, messages: sorted, last };
      })
      .sort((a, b) => b.last.createdAt.getTime() - a.last.createdAt.getTime());
  }, [messages]);

  const [selectedKey, setSelectedKey] = useState<string | null>(threads[0]?.key ?? null);
  const selected = threads.find((t) => t.key === selectedKey) ?? null;

  if (threads.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-1 font-bold">صندوق پیام</h3>
        <p className="py-8 text-center text-sm text-muted-foreground">
          هنوز پیامی از پیام‌رسان‌های متصل دریافت نشده است.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-[280px_1fr]">
      <div className="max-h-[600px] space-y-1 overflow-y-auto border-l border-border pl-4">
        {threads.map((thread) => {
          const senderLabel = thread.last.senderName || thread.last.senderHandle || thread.externalId;
          return (
            <button
              key={thread.key}
              onClick={() => setSelectedKey(thread.key)}
              className={`flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-right text-xs transition-colors ${
                selectedKey === thread.key ? "bg-primary/10 text-primary" : "hover:bg-secondary/60"
              }`}
            >
              <span className="flex items-center gap-1.5 font-medium">
                <span>{PROVIDER_ICON[thread.provider]}</span>
                {senderLabel}
              </span>
              <span className="truncate text-muted-foreground">{thread.last.text}</span>
            </button>
          );
        })}
      </div>

      {selected && <ThreadView key={selected.key} thread={selected} />}
    </div>
  );
}

function ThreadView({
  thread,
}: {
  thread: { provider: Provider; externalId: string; messages: InboxMessage[]; last: InboxMessage };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const senderLabel = thread.last.senderName || thread.last.senderHandle || thread.externalId;

  async function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/inbox/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: thread.provider,
          externalId: thread.externalId,
          text: formData.get("text"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ارسال پاسخ ناموفق بود");
      (event.currentTarget as HTMLFormElement).reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال پاسخ ناموفق بود");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm">
          {PROVIDER_ICON[thread.provider]}
        </span>
        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <User size={13} className="text-muted-foreground" />
            {senderLabel}
          </div>
          <div className="text-xs text-muted-foreground">{PROVIDER_LABEL[thread.provider]}</div>
        </div>
      </div>

      <div className="mb-3 max-h-96 space-y-2 overflow-y-auto">
        {thread.messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              m.direction === "OUT" ? "ml-auto bg-primary/10 text-primary" : "mr-auto bg-secondary/60"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.text}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{formatJalali(m.createdAt)}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleReply} className="flex items-center gap-2">
        <Input name="text" placeholder="پاسخ..." required className="flex-1" />
        <Button type="submit" size="sm" disabled={loading}>
          <Send size={14} />
        </Button>
      </form>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
