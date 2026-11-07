import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSession } from "@/lib/auth/session";
import { isFullAdmin } from "@/lib/auth/roles";
import { getEventLogs, getEventLogActions } from "@/lib/queries/admin";
import { formatJalali } from "@/lib/format";

const ACTION_LABEL: Record<string, string> = {
  "otp.request": "درخواست کد ورود",
  "otp.verify": "تایید کد ورود",
  "login.password": "ورود با رمز عبور",
  "order.request": "درخواست خرید",
  "payment.result": "نتیجه پرداخت",
};

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; success?: string; q?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFullAdmin(session)) redirect("/admin/inbox");

  const params = await searchParams;
  const success = params.success === "ok" ? true : params.success === "fail" ? false : undefined;

  const [logs, actions] = await Promise.all([
    getEventLogs({ action: params.action || undefined, success, q: params.q || undefined }),
    getEventLogActions(),
  ]);

  return (
    <div>
      <PageHeader title="رویدادها و لاگ سیستم" description="ورودهای ناموفق، درخواست‌های خرید، پیامک و سایر رویدادها" />

      <form className="mb-5 flex flex-wrap items-center gap-2" method="get">
        <select
          name="action"
          defaultValue={params.action ?? ""}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="">همه رویدادها</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABEL[a] ?? a}
            </option>
          ))}
        </select>
        <select
          name="success"
          defaultValue={params.success ?? ""}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="">موفق و ناموفق</option>
          <option value="ok">فقط موفق</option>
          <option value="fail">فقط ناموفق</option>
        </select>
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="جستجو در شماره موبایل یا پیام..."
          dir="ltr"
          className="h-9 flex-1 min-w-48 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          فیلتر
        </button>
      </form>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          رویدادی یافت نشد.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رویداد</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>شماره موبایل</TableHead>
              <TableHead>پیام</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>زمان</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{ACTION_LABEL[log.action] ?? log.action}</TableCell>
                <TableCell>
                  <Badge variant={log.success ? "success" : "destructive"}>
                    {log.success ? "موفق" : "ناموفق"}
                  </Badge>
                </TableCell>
                <TableCell dir="ltr" className="text-left text-muted-foreground">
                  {log.phone ?? "—"}
                </TableCell>
                <TableCell className="max-w-72 truncate text-muted-foreground" title={log.message ?? ""}>
                  {log.message ?? "—"}
                </TableCell>
                <TableCell dir="ltr" className="text-left text-muted-foreground">
                  {log.ip ?? "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatJalali(log.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
