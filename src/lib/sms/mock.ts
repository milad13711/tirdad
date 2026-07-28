import type { SmsProvider } from "./provider";

/**
 * Dev-mode provider: prints the OTP to the server console instead of sending
 * a real SMS. This is the default (SMS_PROVIDER=mock) until a real provider
 * is wired and verified.
 */
export const mockSmsProvider: SmsProvider = {
  async sendOtp(phone, code) {
    console.log(`[sms:mock] OTP for ${phone}: ${code}`);
  },
};
