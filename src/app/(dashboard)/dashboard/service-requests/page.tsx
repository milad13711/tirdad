import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { NewServiceRequestForm } from "@/components/dashboard/new-service-request-form";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getUserServiceRequests } from "@/lib/queries/dashboard";
import { formatJalali } from "@/lib/format";
import { serviceRequestStatusLabel, serviceRequestStatusVariant, serviceRequestTypeLabel } from "@/lib/status-labels";

export default async function ServiceRequestsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const requests = await getUserServiceRequests(session.sub);

  return (
    <div>
      <PageHeader
        title="درخواست خدمات سفارشی"
        description="طراحی تیزر، تصویر یا سایت حرفه‌ای — مستقیم از مجید تیرداد درخواست بدید"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {requests.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              هنوز درخواستی ثبت نکرده‌اید.
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">
                    {serviceRequestTypeLabel[request.type]}
                  </div>
                  <div className="line-clamp-2 font-medium">{request.description}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatJalali(request.createdAt)}
                  </div>
                </div>
                <Badge variant={serviceRequestStatusVariant[request.status]}>
                  {serviceRequestStatusLabel[request.status]}
                </Badge>
              </div>
            ))
          )}
        </div>

        <NewServiceRequestForm />
      </div>
    </div>
  );
}
