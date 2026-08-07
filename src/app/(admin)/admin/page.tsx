import { redirect } from "next/navigation";
import { BadgeDollarSign, MessagesSquare, Sparkles, Users, Zap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { BarList } from "@/components/admin/bar-list";
import { ReportsSmsCreditCard } from "@/components/admin/reports-sms-credit-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatJalali, formatToman } from "@/lib/format";
import { getAdminOrders, getAdminStats, getSmsSettings } from "@/lib/queries/admin";
import { getMarketingCampaigns } from "@/lib/queries/marketing";
import { orderStatusLabel, orderStatusVariant } from "@/lib/status-labels";
import { channelComparison, CHANNEL_LABEL } from "@/lib/reports";

export default async function AdminOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    stats,
    orders,
    freePromptCount,
    premiumPromptCount,
    monthlyOrders,
    campaigns,
    inboundByProvider,
    smsSettings,
  ] = await Promise.all([
    getAdminStats(),
    getAdminOrders(),
    prisma.aiTool.count({ where: { active: true, price: 0 } }),
    prisma.aiTool.count({ where: { active: true, price: { gt: 0 } } }),
    prisma.order.aggregate({
      where: { status: "PAID", createdAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: true,
    }),
    getMarketingCampaigns(),
    prisma.inboxMessage.groupBy({
      by: ["provider"],
      where: { direction: "IN" },
      _count: { _all: true },
    }),
    getSmsSettings(),
  ]);

  const campaignComparison = channelComparison(campaigns);
  const inboundComparison = inboundByProvider.map((row) => ({
    key: row.provider,
    label: CHANNEL_LABEL[row.provider] ?? row.provider,
    value: row._count._all,
  }));

  return (
    <div>
      <PageHeader title="داشبورد" description="عملکرد کلی پلتفرم و گزارش‌های تفصیلی" />

      <AdminTabs
        tabs={[
          {
            key: "overview",
            label: "نمای کلی",
            content: (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="درآمد این ماه"
                    value={`${formatToman(stats.monthlyRevenue)} تومان`}
                    icon={BadgeDollarSign}
                  />
                  <StatCard label="کاربران فعال" value={formatToman(stats.activeUsers)} icon={Users} />
                  <StatCard label="اجرای ابزار AI" value={formatToman(stats.aiRuns)} icon={Zap} />
                  <StatCard label="لیدهای جدید" value={formatToman(stats.newLeads)} icon={MessagesSquare} />
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-5 font-bold">آخرین سفارش‌ها</h3>
                  {orders.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">هنوز سفارشی ثبت نشده است.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>شماره سفارش</TableHead>
                          <TableHead>کاربر</TableHead>
                          <TableHead>مورد</TableHead>
                          <TableHead>مبلغ (تومان)</TableHead>
                          <TableHead>وضعیت</TableHead>
                          <TableHead>تاریخ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              #{order.id.slice(-6).toUpperCase()}
                            </TableCell>
                            <TableCell>{order.user.name ?? order.user.phone}</TableCell>
                            <TableCell className="text-muted-foreground">{order.itemLabel}</TableCell>
                            <TableCell>{formatToman(order.amount)}</TableCell>
                            <TableCell>
                              <Badge variant={orderStatusVariant[order.status]}>
                                {orderStatusLabel[order.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatJalali(order.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </>
            ),
          },
          {
            key: "reports",
            label: "گزارش‌ها",
            content: (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <ReportsSmsCreditCard connected={smsSettings?.enabled ?? false} />
                  <StatCard
                    label="مجموع تراکنش‌های ماه جاری"
                    value={`${formatToman(monthlyOrders._sum.amount ?? 0)} تومان`}
                    change={`${monthlyOrders._count.toLocaleString("fa-IR")} تراکنش`}
                    icon={BadgeDollarSign}
                  />
                  <StatCard
                    label="پرامپت‌های رایگان منتشرشده"
                    value={freePromptCount.toLocaleString("fa-IR")}
                    icon={Sparkles}
                  />
                  <StatCard
                    label="پرامپت‌های غیررایگان منتشرشده"
                    value={premiumPromptCount.toLocaleString("fa-IR")}
                    icon={Sparkles}
                  />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <MessagesSquare size={16} className="text-primary" />
                      <h3 className="font-bold">پیام‌های دریافتی در پیام‌رسان‌ها</h3>
                    </div>
                    {inboundComparison.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        هنوز پیامی دریافت نشده است.
                      </p>
                    ) : (
                      <BarList items={inboundComparison} />
                    )}
                  </div>

                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="mb-5 font-bold">نرخ کلیک کمپین‌های مارکتینگ (به تفکیک کانال)</h3>
                    {campaignComparison.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        هنوز کمپینی ارسال نشده است.
                      </p>
                    ) : (
                      <BarList items={campaignComparison} />
                    )}
                  </div>
                </div>
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
