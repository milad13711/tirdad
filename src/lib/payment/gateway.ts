import * as zarinpal from "@/lib/payment/zarinpal";
import * as bitpay from "@/lib/payment/bitpay";

export type GatewayName = "zarinpal" | "bitpay";

// Single active gateway for the whole site, switched with PAYMENT_GATEWAY
// in .env — not a per-checkout choice. Whichever gateway was active when an
// order's payment was requested is recorded on its Transaction row (see
// requestGatewayPayment), so the callback still verifies against the right
// gateway even if the env var is changed afterwards.
export function activeGateway(): GatewayName {
  return process.env.PAYMENT_GATEWAY?.toLowerCase() === "bitpay" ? "bitpay" : "zarinpal";
}

export async function requestGatewayPayment(params: {
  amount: number;
  description: string;
  callbackUrl: string;
  mobile?: string;
}): Promise<{ gateway: GatewayName; token: string; paymentUrl: string }> {
  const gateway = activeGateway();

  if (gateway === "bitpay") {
    const { idGet, paymentUrl } = await bitpay.requestPayment(params);
    return { gateway, token: idGet, paymentUrl };
  }

  const { authority, paymentUrl } = await zarinpal.requestPayment(params);
  return { gateway, token: authority, paymentUrl };
}

// storedToken is the Transaction.refId saved by requestGatewayPayment above
// (ZarinPal's authority, or BitPay's id_get) — used as a fallback for
// BitPay, whose redirect is expected to echo id_get back itself.
export async function verifyGatewayCallback(
  gateway: GatewayName,
  amount: number,
  searchParams: URLSearchParams,
  storedToken: string | null,
): Promise<{ success: boolean; refId?: string }> {
  if (gateway === "bitpay") {
    const transId = searchParams.get("trans_id");
    const idGet = searchParams.get("id_get") ?? storedToken;
    if (!transId || !idGet || Number(transId) <= 0) return { success: false };
    return bitpay.verifyPayment({ transId, idGet });
  }

  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");
  if (status !== "OK" || !authority) return { success: false };
  return zarinpal.verifyPayment({ amount, authority });
}
