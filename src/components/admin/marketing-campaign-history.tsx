import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarList } from "@/components/admin/bar-list";
import { formatJalali } from "@/lib/format";
import { CHANNEL_LABEL, channelComparison } from "@/lib/reports";

interface Campaign {
  id: string;
  channel: string;
  message: string;
  recipientCount: number;
  sentCount: number;
  clickCount: number;
  createdAt: Date;
}

export function MarketingCampaignHistory({
  campaigns,
  whatsappReachable,
}: {
  campaigns: Campaign[];
  whatsappReachable: number;
}) {
  const comparison = channelComparison(campaigns);

  return (
    <div className="space-y-6">
      {comparison.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-5 font-bold">مقایسه کانال‌ها</h3>
          <BarList items={comparison} />
          <p className="mt-4 text-xs text-muted-foreground">
            {whatsappReachable.toLocaleString("fa-IR")} مخاطب دارای شماره موبایل قابل ارسال دستی در واتساپ.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-5 font-bold">تاریخچه کمپین‌ها</h3>
        {campaigns.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">هنوز کمپینی ارسال نشده است.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کانال</TableHead>
                <TableHead>متن پیام</TableHead>
                <TableHead>مخاطبان</TableHead>
                <TableHead>ارسال‌شده</TableHead>
                <TableHead>کلیک</TableHead>
                <TableHead>نرخ کلیک</TableHead>
                <TableHead>تاریخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Badge>{CHANNEL_LABEL[c.channel] ?? c.channel}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{c.message}</TableCell>
                  <TableCell>{c.recipientCount.toLocaleString("fa-IR")}</TableCell>
                  <TableCell>{c.sentCount.toLocaleString("fa-IR")}</TableCell>
                  <TableCell>{c.clickCount.toLocaleString("fa-IR")}</TableCell>
                  <TableCell>
                    {c.sentCount > 0 ? Math.round((c.clickCount / c.sentCount) * 100) : 0}٪
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatJalali(c.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
