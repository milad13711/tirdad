import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatJalali } from "@/lib/format";

const CHANNEL_LABEL: Record<string, string> = {
  PUSH: "اعلان",
  SMS: "پیامک",
  WHATSAPP: "واتساپ",
  TELEGRAM: "تلگرام",
  BALE: "بله",
  INSTAGRAM: "اینستاگرام",
};

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
  const byChannel = new Map<string, { sent: number; clicks: number }>();
  for (const c of campaigns) {
    const entry = byChannel.get(c.channel) ?? { sent: 0, clicks: 0 };
    entry.sent += c.sentCount;
    entry.clicks += c.clickCount;
    byChannel.set(c.channel, entry);
  }
  const maxSent = Math.max(1, ...[...byChannel.values()].map((v) => v.sent));

  return (
    <div className="space-y-6">
      {byChannel.size > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-5 font-bold">مقایسه کانال‌ها</h3>
          <div className="space-y-3">
            {[...byChannel.entries()].map(([channel, stats]) => {
              const rate = stats.sent > 0 ? Math.round((stats.clicks / stats.sent) * 100) : 0;
              return (
                <div key={channel}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{CHANNEL_LABEL[channel] ?? channel}</span>
                    <span className="text-muted-foreground">
                      {stats.sent.toLocaleString("fa-IR")} ارسال · {stats.clicks.toLocaleString("fa-IR")} کلیک ·
                      {" "}
                      {rate}٪ نرخ کلیک
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(stats.sent / maxSent) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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
