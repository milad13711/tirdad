/**
 * ZarinPal REST API v4 client (https://api.zarinpal.com/pg/v4/...).
 * Request/response shapes verified against ZarinPal-Lab's own sample code
 * (github.com/ZarinPal-Lab/Zarinpal-RestAPI-Sample-php): responses are
 * `{ data: { code, ... }, errors: {...} | null }`, code 100 (or 101 for an
 * already-verified transaction) means success.
 *
 * Sandbox host (sandbox.zarinpal.com, same paths) lets ZARINPAL_MERCHANT_ID
 * be any placeholder UUID and always "succeeds" without a real bank step —
 * useful for developing without a merchant account. Toggle with
 * ZARINPAL_SANDBOX=true.
 */

function apiBase() {
  return process.env.ZARINPAL_SANDBOX === "true"
    ? "https://sandbox.zarinpal.com"
    : "https://api.zarinpal.com";
}

function startPayBase() {
  return process.env.ZARINPAL_SANDBOX === "true"
    ? "https://sandbox.zarinpal.com/pg/StartPay"
    : "https://www.zarinpal.com/pg/StartPay";
}

interface ZarinpalDataResponse<T> {
  data: (T & { code: number; message?: string }) | Record<string, never>;
  errors: { code: number; message: string } | [] | null;
}

function merchantId() {
  const id = process.env.ZARINPAL_MERCHANT_ID;
  if (!id) throw new Error("ZARINPAL_MERCHANT_ID is not configured");
  return id;
}

export async function requestPayment(params: {
  amount: number;
  description: string;
  callbackUrl: string;
  mobile?: string;
}): Promise<{ authority: string; paymentUrl: string }> {
  const response = await fetch(`${apiBase()}/pg/v4/payment/request.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: merchantId(),
      amount: params.amount,
      description: params.description,
      callback_url: params.callbackUrl,
      metadata: params.mobile ? { mobile: params.mobile } : undefined,
    }),
  });

  const result = (await response.json()) as ZarinpalDataResponse<{ authority: string }>;
  if (!("code" in result.data) || result.data.code !== 100) {
    const message =
      (Array.isArray(result.errors) ? undefined : result.errors?.message) ??
      "درخواست پرداخت زرین‌پال ناموفق بود";
    throw new Error(message);
  }

  return {
    authority: result.data.authority,
    paymentUrl: `${startPayBase()}/${result.data.authority}`,
  };
}

export async function verifyPayment(params: {
  amount: number;
  authority: string;
}): Promise<{ success: boolean; refId?: string }> {
  const response = await fetch(`${apiBase()}/pg/v4/payment/verify.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: merchantId(),
      amount: params.amount,
      authority: params.authority,
    }),
  });

  const result = (await response.json()) as ZarinpalDataResponse<{
    ref_id: number;
  }>;

  // 100 = freshly verified, 101 = already verified (still a success — the
  // callback can be hit more than once for the same authority).
  if ("code" in result.data && (result.data.code === 100 || result.data.code === 101)) {
    return { success: true, refId: String(result.data.ref_id) };
  }
  return { success: false };
}
