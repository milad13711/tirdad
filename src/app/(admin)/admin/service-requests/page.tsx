import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/auth/session";
import { getAdminServiceRequests } from "@/lib/queries/admin";
import { formatJalali } from "@/lib/format";
import { serviceRequestTypeLabel } from "@/lib/status-labels";
import { ServiceRequestStatusSelect } from "@/components/admin/service-request-status-select";

export default async function AdminServiceRequestsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const requests = await getAdminServiceRequests();

  return (
    <div>
      <PageHeader
        title="درخواست‌های خدمات سفارشی"
        description="درخواست‌های طراحی تیزر، تصویر و سایت از کاربران"
      />

      {requests.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          هنوز درخواستی ثبت نشده است.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کاربر</TableHead>
              <TableHead>نوع</TableHead>
              <TableHead>توضیحات</TableHead>
              <TableHead>تاریخ</TableHead>
              <TableHead>وضعیت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.user.name ?? request.user.phone}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {serviceRequestTypeLabel[request.type]}
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {request.description}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatJalali(request.createdAt)}
                </TableCell>
                <TableCell>
                  <ServiceRequestStatusSelect id={request.id} status={request.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
