import { prisma } from "@/lib/db";
import type { SmsProvider } from "./provider";
import { limoSendSms } from "./limosms-client";

/**
 * LimoSMS (api.limosms.com) OTP provider.
 *
 * Two ways to send the OTP, tried in order:
 * 1. Pattern/template message (LIMO_API_KEY + LIMO_PATTERN_ID env vars) —
 *    requires a pre-approved OTP pattern in the LimoSMS panel. Preferred
 *    when available since carriers treat pattern messages as more
 *    reliable/less likely to be filtered as spam.
 * 2. Plain text via the same connection the admin already configured in
 *    /admin/settings (پیامک tab, SmsSettings row) — no separate pattern
 *    approval needed, just reuses apiKey + senderNumber already saved
 *    there. Falls back to this since most admins won't have step 1 set up.
 *
 * If neither is configured, logs to the console instead of throwing, so
 * local/dev environments keep working without any SMS setup.
 */

const LIMO_SEND_PATTERN_URL = "https://api.limosms.com/api/sendpatternmessage";

async function sendViaPattern(phone: string, code: string): Promise<boolean> {
  const apiKey = process.env.LIMO_API_KEY;
  const patternId = process.env.LIMO_PATTERN_ID;
  if (!apiKey || !patternId) return false;

  const response = await fetch(LIMO_SEND_PATTERN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ApiKey: apiKey },
    body: JSON.stringify({ MobileNumber: phone, OtpId: patternId, ReplaceToken: [code] }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`LimoSMS request failed (${response.status}): ${body}`);
  }
  return true;
}

async function sendViaSavedConnection(phone: string, code: string): Promise<boolean> {
  const settings = await prisma.smsSettings.findUnique({ where: { id: 1 } });
  if (!settings?.enabled || !settings.apiKey || !settings.senderNumber) return false;

  await limoSendSms(settings.apiKey, {
    senderNumber: settings.senderNumber,
    message: `کد ورود شما به تیرداد: ${code}`,
    mobileNumbers: [phone],
  });
  return true;
}

export const limoSmsProvider: SmsProvider = {
  async sendOtp(phone, code) {
    if (await sendViaPattern(phone, code)) return;
    if (await sendViaSavedConnection(phone, code)) return;
    console.log(`[sms:mock] OTP for ${phone}: ${code} (no SMS provider configured)`);
  },
};
