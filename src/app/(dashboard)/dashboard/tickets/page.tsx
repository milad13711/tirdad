import { PageHeader } from "@/components/dashboard/page-header";
import { NewTicketForm } from "@/components/dashboard/new-ticket-form";
import { Badge } from "@/components/ui/badge";
import { myTickets } from "@/lib/mock-data";

const statusVariant = {
  "در انتظار پاسخ": "warning",
  "پاسخ داده‌شده": "success",
  "بسته‌شده": "outline",
} as const;

export default function TicketsPage() {
  return (
    <div>
      <PageHeader title="تیکت پشتیبانی" description="پیگیری درخواست‌های پشتیبانی شما" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {myTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-5"
            >
              <div>
                <div className="mb-1 text-xs text-muted-foreground">{ticket.id}</div>
                <div className="font-medium">{ticket.subject}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  آخرین بروزرسانی: {ticket.updatedAt}
                </div>
              </div>
              <Badge variant={statusVariant[ticket.status]}>{ticket.status}</Badge>
            </div>
          ))}
        </div>

        <NewTicketForm />
      </div>
    </div>
  );
}
