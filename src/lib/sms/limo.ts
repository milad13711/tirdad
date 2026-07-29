import type { SmsProvider } from "./provider";

/**
 * LimoSMS (api.limosms.com) OTP provider.
 *
 * Request shape (endpoint, ApiKey header, OtpId/ReplaceToken/MobileNumber
 * body fields) matches LimoSMS's own C#/PHP sample code from
 * https://api.limosms.com/. Their pattern/template id (OtpId) must be
 * pre-approved in the LimoSMS panel before use. The success/failure
 * response body shape isn't documented publicly, so failures are detected
 * from the HTTP status only — if LimoSMS returns 200 with an in-body error
 * instead, tighten the check below once that's confirmed against the panel.
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
