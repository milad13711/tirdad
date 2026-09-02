/**
 * BitPay.ir gateway client, following BitPay's own Node.js sample
 * (github.com/bitpaydotir/BitPayNodeJsSampleCode).
 *
 * Unlike ZarinPal's JSON REST API, BitPay's endpoints take multipart
 * form-data and the request step replies with a bare number in the
 * response body (not JSON) — positive = the id_get to redirect the buyer
 * to, negative = one of a fixed set of error codes. The verify step does
 * return JSON, but only when json=1 is sent.
 *
 * Amounts here are Toman (this codebase's unit throughout, matching
 * ZarinPal v4) — BitPay itself works in Rial, so every amount is
 * multiplied by 10 before being sent.
 *
 * BitPay has no publicly documented sandbox mode the way ZarinPal does;
 * testing happens against the real gateway with a real (if small) amount.
 */

const REQUEST_ERRORS: Record<number, string> = {
  "-1": "کد API بیت‌پی نامعتبر است",
  "-2": "مبلغ پرداخت نامعتبر است یا کمتر از حداقل مجاز است",
  "-3": "آدرس بازگشت (redirect) تنظیم نشده است",
  "-4": "درگاهی با این اطلاعات یافت نشد یا در انتظار تایید است",
  "-5": "خطا در اتصال به درگاه بیت‌پی، لطفاً دوباره تلاش کنید",
};

function apiKey() {
  const key = process.env.BITPAY_API_KEY;
  if (!key) throw new Error("BITPAY_API_KEY is not configured");
  return key;
}

export async function requestPayment(params: {
  amount: number; // Toman
  description: string;
  callbackUrl: string;
  name?: string;
  email?: string;
  factorId?: string;
}): Promise<{ idGet: string; paymentUrl: string }> {
  const form = new FormData();
  form.append("api", apiKey());
  form.append("amount", String(params.amount * 10)); // Toman -> Rial
  form.append("redirect", params.callbackUrl);
  if (params.name) form.append("name", params.name);
  if (params.email) form.append("email", params.email);
  if (params.description) form.append("description", params.description);
  if (params.factorId) form.append("factorId", params.factorId);

  const response = await fetch("https://bitpay.ir/payment/gateway-send", {
    method: "POST",
    body: form,
  });
  const raw = (await response.text()).trim();
  const code = Number(raw);

  if (!Number.isFinite(code) || code === 0) {
    throw new Error("پاسخ نامعتبر از درگاه بیت‌پی دریافت شد");
  }
  if (code < 0) {
    throw new Error(REQUEST_ERRORS[code] ?? "درخواست پرداخت بیت‌پی ناموفق بود");
  }

  return { idGet: String(code), paymentUrl: `https://bitpay.ir/payment/gateway-${code}-get` };
}

export async function verifyPayment(params: {
  transId: string;
  idGet: string;
}): Promise<{ success: boolean; refId?: string }> {
  const form = new FormData();
  form.append("api", apiKey());
  form.append("trans_id", params.transId);
  form.append("id_get", params.idGet);
  form.append("json", "1");

  const response = await fetch("https://bitpay.ir/payment/gateway-result-second", {
    method: "POST",
    body: form,
  });
  const result = (await response.json()) as { status?: number };

  // 1 = freshly verified, 11 = already verified (still a success — the
  // callback can be hit more than once for the same transaction).
  if (result.status === 1 || result.status === 11) {
    return { success: true, refId: params.transId };
  }
  return { success: false };
}
