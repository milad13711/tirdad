"use client";

import { AtSign, ImageIcon, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LeadStageSelect } from "@/components/admin/lead-stage-select";
import { DeleteButton } from "@/components/admin/delete-button";
import { leadSourceLabel } from "@/lib/status-labels";

interface LeadCardProps {
  lead: {
    id: string;
    name: string;
    phone: string | null;
    topic: string | null;
    pageUrl?: string | null;
    attachmentUrl?: string | null;
    source: "DIRECT" | "COMMENT" | "BIO_LINK" | "WEBSITE";
    stage: "NEW" | "CONTACTED" | "OFFERED" | "CONVERTED" | "LOST";
  };
}

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="text-sm font-medium">{lead.name}</div>
        <DeleteButton
          endpoint="/api/admin/leads"
          id={lead.id}
          confirmMessage={`لید «${lead.name}» حذف شود؟`}
        />
      </div>
      {lead.phone && (
        <a href={`tel:${lead.phone}`} dir="ltr" className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
          <Phone size={12} />
          {lead.phone}
        </a>
      )}
      {lead.pageUrl && (
        <a
          href={lead.pageUrl.startsWith("http") ? lead.pageUrl : `https://instagram.com/${lead.pageUrl.replace(/^@/, "")}`}
          target="_blank"
          rel="noreferrer"
          dir="ltr"
          className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
        >
          <AtSign size={12} />
          {lead.pageUrl}
        </a>
      )}
      {lead.attachmentUrl && (
        <a
          href={lead.attachmentUrl}
          target="_blank"
          rel="noreferrer"
          className="mb-1 flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <ImageIcon size={12} />
          مشاهده اسکرین‌شات بیو
        </a>
      )}
      <div className="mb-2 text-xs text-muted-foreground">{lead.topic}</div>
      <Badge variant="secondary">{leadSourceLabel[lead.source]}</Badge>
      <LeadStageSelect leadId={lead.id} stage={lead.stage} />
    </div>
  );
}
