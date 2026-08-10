"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AtSign, Phone, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatJalali } from "@/lib/format";

interface PageAnalysisLead {
  id: string;
  name: string;
  phone: string | null;
  pageUrl: string | null;
  attachmentUrl: string | null;
  analysisNote: string | null;
  respondedAt: Date | null;
  createdAt: Date;
}

function instagramLink(pageUrl: string) {
  return pageUrl.startsWith("http") ? pageUrl : `https://instagram.com/${pageUrl.replace(/^@/, "")}`;
}

function RequestCard({ lead }: { lead: PageAnalysisLead }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleRespond(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSent(false);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/leads/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, message: formData.get("message") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ارسال پاسخ ناموفق بود");
      setSent(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال پاسخ ناموفق بود");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {lead.name}
            {lead.respondedAt ? (
              <Badge variant="success">پاسخ داده شده</Badge>
            ) : (
              <Badge variant="warning">در انتظار پاسخ</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatJalali(lead.createdAt)}</p>
        </div>
        <DeleteButton endpoint="/api/admin/leads" id={lead.id} confirmMessage={`درخواست «${lead.name}» حذف شود؟`} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {lead.phone && (
          <a href={`tel:${lead.phone}`} dir="ltr" className="flex items-center gap-1.5 hover:text-primary">
            <Phone size={12} />
            {lead.phone}
          </a>
        )}
        {lead.pageUrl && (
          <a
            href={instagramLink(lead.pageUrl)}
            target="_blank"
            rel="noreferrer"
            dir="ltr"
            className="flex items-center gap-1.5 hover:text-primary"
          >
            <AtSign size={12} />
            {lead.pageUrl}
          </a>
        )}
      </div>

      {lead.attachmentUrl && (
        <a href={lead.attachmentUrl} target="_blank" rel="noreferrer" className="mb-4 block">
          <img
            src={lead.attachmentUrl}
            alt={`اسکرین‌شات بیو ${lead.name}`}
            className="max-h-48 w-full rounded-lg border border-border object-cover object-top"
          />
        </a>
      )}

      <form onSubmit={handleRespond} className="space-y-2">
        <textarea
          name="message"
          dir="rtl"
          rows={3}
          defaultValue={lead.analysisNote ?? ""}
          placeholder="نتیجه آنالیز پیج رو اینجا بنویس — با ارسال، پیامک به شماره کاربر می‌ره."
          required
          className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={loading || !lead.phone}>
            <Send size={14} />
            {loading ? "در حال ارسال..." : "ارسال پاسخ (پیامک)"}
          </Button>
          {!lead.phone && <span className="text-xs text-muted-foreground">شماره موبایل ثبت نشده</span>}
          {sent && <span className="text-xs text-emerald-500">ارسال شد</span>}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </form>
    </div>
  );
}

export function PageAnalysisPanel({ leads }: { leads: PageAnalysisLead[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="py-8 text-center text-sm text-muted-foreground">
          هنوز درخواست آنالیز پیجی از لندینگ ثبت نشده است.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {leads.map((lead) => (
        <RequestCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}
