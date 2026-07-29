/**
 * Best-effort admin notifications via the Telegram Bot API. Fire-and-forget:
 * callers should not await this on the critical path (payment/order flows
 * must succeed even if Telegram is unreachable or unconfigured).
 */
export async function notifyAdmins(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
  } catch {
    // Notification failures must never break the caller's main flow.
  }
}
