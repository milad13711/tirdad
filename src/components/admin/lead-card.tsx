"use client";

import { Badge } from "@/components/ui/badge";
import { LeadStageSelect } from "@/components/admin/lead-stage-select";
import { DeleteButton } from "@/components/admin/delete-button";
import { leadSourceLabel } from "@/lib/status-labels";

interface LeadCardProps {
  lead: {
    id: string;
    name: string;
    topic: string | null;
    source: "DIRECT" | "COMMENT" | "BIO_LINK";
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
      <div className="mb-2 text-xs text-muted-foreground">{lead.topic}</div>
      <Badge variant="secondary">{leadSourceLabel[lead.source]}</Badge>
      <LeadStageSelect leadId={lead.id} stage={lead.stage} />
    </div>
  );
}
