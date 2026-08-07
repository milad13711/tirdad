// Shared by /admin/marketing and /admin/reports — both render a
// per-channel sent/click comparison built from the same MarketingCampaign
// rows, just alongside different other stats.
export const CHANNEL_LABEL: Record<string, string> = {
  PUSH: "اعلان",
  SMS: "پیامک",
  WHATSAPP: "واتساپ",
  TELEGRAM: "تلگرام",
  BALE: "بله",
  INSTAGRAM: "اینستاگرام",
};

export function channelComparison(campaigns: { channel: string; sentCount: number; clickCount: number }[]) {
  const byChannel = new Map<string, { sent: number; clicks: number }>();
  for (const c of campaigns) {
    const entry = byChannel.get(c.channel) ?? { sent: 0, clicks: 0 };
    entry.sent += c.sentCount;
    entry.clicks += c.clickCount;
    byChannel.set(c.channel, entry);
  }
  return [...byChannel.entries()].map(([channel, stats]) => {
    const rate = stats.sent > 0 ? Math.round((stats.clicks / stats.sent) * 100) : 0;
    return {
      key: channel,
      label: CHANNEL_LABEL[channel] ?? channel,
      value: stats.sent,
      sub: `${stats.sent.toLocaleString("fa-IR")} ارسال · ${stats.clicks.toLocaleString("fa-IR")} کلیک · ${rate}٪ نرخ کلیک`,
    };
  });
}
