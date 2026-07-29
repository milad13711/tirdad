import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { NewTicketForm } from "@/components/dashboard/new-ticket-form";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getUserTickets } from "@/lib/queries/dashboard";
import { formatJalali } from "@/lib/format";
import { ticketStatusLabel, ticketStatusVariant } from "@/lib/status-labels";

export default async function TicketsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tickets = await getUserTickets(session.sub);

  return (
    <div>
      <PageHeader title="تیکت پشتیبانی" description="پیگیری درخواست‌های پشتیبانی شما" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {tickets.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              هنوز تیکتی ثبت نکرده‌اید.
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-5"
              >
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">
                    #{ticket.id.slice(-6).toUpperCase()}
                  </div>
                  <div className="font-medium">{ticket.subject}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    آخرین بروزرسانی: {formatJalali(ticket.updatedAt)}
                  </div>
                </div>
                <Badge variant={ticketStatusVariant[ticket.status]}>
                  {ticketStatusLabel[ticket.status]}
                </Badge>
              </div>
            ))
          )}
        </div>

        <NewTicketForm />
      </div>
    </div>
  );
}
