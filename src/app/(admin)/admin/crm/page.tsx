import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getAdminLeads } from "@/lib/queries/admin";
import { leadStageLabel } from "@/lib/status-labels";
import { NewLeadForm } from "@/components/admin/new-lead-form";
import { LeadCard } from "@/components/admin/lead-card";

const STAGE_ORDER = ["NEW", "CONTACTED", "OFFERED", "CONVERTED", "LOST"] as const;

export default async function AdminCrmPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const leads = await getAdminLeads();
  const totalLeads = leads.length;
  const converted = leads.filter((lead) => lead.stage === "CONVERTED").length;

  return (
    <div>
      <PageHeader
        title="CRM اینستاگرام"
        description="پیگیری لیدهای دایرکت، کامنت و لینک بایو در قیف فروش"
      />

      <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>
          مجموع لیدها: <strong className="text-foreground">{totalLeads}</strong>
        </span>
        <span>
          نرخ تبدیل:{" "}
          <strong className="text-foreground">
            {totalLeads === 0 ? 0 : Math.round((converted / totalLeads) * 100)}٪
          </strong>
        </span>
      </div>

      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {STAGE_ORDER.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.stage === stage);
          return (
            <div key={stage} className="w-64 shrink-0 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-semibold">{leadStageLabel[stage]}</span>
                <Badge variant="outline">{stageLeads.length}</Badge>
              </div>
              <div className="space-y-3 p-3">
                {stageLeads.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted-foreground">لیدی وجود ندارد</p>
                )}
                {stageLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <NewLeadForm />
    </div>
  );
}
