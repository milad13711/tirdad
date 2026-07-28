import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { crmStages } from "@/lib/mock-data";

export default function AdminCrmPage() {
  const totalLeads = crmStages.reduce((sum, stage) => sum + stage.leads.length, 0);
  const converted = crmStages.find((stage) => stage.key === "converted")?.leads.length ?? 0;

  return (
    <div>
      <PageHeader
        title="CRM اینستاگرام"
        description="پیگیری لیدهای دایرکت، کامنت و لینک بایو در قیف فروش"
        action={<Button size="sm">ثبت لید جدید</Button>}
      />

      <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>
          مجموع لیدها: <strong className="text-foreground">{totalLeads}</strong>
        </span>
        <span>
          نرخ تبدیل:{" "}
          <strong className="text-foreground">
            {Math.round((converted / totalLeads) * 100)}٪
          </strong>
        </span>
      </div>

      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {crmStages.map((stage) => (
          <div
            key={stage.key}
            className="w-64 shrink-0 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">{stage.label}</span>
              <Badge variant="outline">{stage.leads.length}</Badge>
            </div>
            <div className="space-y-3 p-3">
              {stage.leads.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">لیدی وجود ندارد</p>
              )}
              {stage.leads.map((lead) => (
                <div key={lead.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="mb-1.5 text-sm font-medium">{lead.name}</div>
                  <div className="mb-2 text-xs text-muted-foreground">{lead.topic}</div>
                  <Badge variant="secondary">{lead.source}</Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
