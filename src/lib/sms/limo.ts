import type { SmsProvider } from "./provider";

/**
 * LimoSMS (api.limosms.com) OTP provider.
 *
 * IMPORTANT — UNVERIFIED AGAINST OFFICIAL DOCS:
 * The LimoSMS developer documentation at https://api.limosms.com/ returned
 * HTTP 403 to every automated fetch attempt while this was written, so the
 * endpoint path, parameter names, and auth header below are the best-effort
 * shape based on how similar Iranian "pattern message" SMS panels work
 * (a pre-approved template id + token substitution for OTP codes), NOT a
 * confirmed contract. Before switching SMS_PROVIDER to "limo" in production:
 *   1. Log into the LimoSMS panel -> developer/API docs section.
 *   2. Confirm the endpoint, auth method (header vs query param), and the
 *      exact field names for: api key, pattern/template id, mobile number,
 *      and template tokens.
 *   3. Update the fetch call below to match — this file is the only place
 *      that needs to change.
 */

const LIMO_SEND_PATTERN_URL = "https://api.limosms.com/api/sendpatternmessage";

export const limoSmsProvider: SmsProvider = {
  async sendOtp(phone, code) {
    const apiKey = process.env.LIMO_API_KEY;
    const patternId = process.env.LIMO_PATTERN_ID;

    if (!apiKey || !patternId) {
      throw new Error(
        "LimoSMS is not configured: set LIMO_API_KEY and LIMO_PATTERN_ID in the environment.",
      );
    }

    const response = await fetch(LIMO_SEND_PATTERN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ApiKey: apiKey,
      },
      body: JSON.stringify({
        MobileNumber: phone,
        OtpId: patternId,
        ReplaceToken: [code],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`LimoSMS request failed (${response.status}): ${body}`);
    }
  },
};
