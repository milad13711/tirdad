/**
 * Thin client for LimoSMS's RESTful API (https://api.limosms.com/), per
 * their published docs. All endpoints are POST, authenticated via an
 * `ApiKey` header, JSON in/out.
 */

const BASE_URL = "https://api.limosms.com/api";

export class LimoSmsError extends Error {}

async function callLimo(path: string, apiKey: string, body: unknown): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ApiKey: apiKey },
      body: body === undefined ? "" : JSON.stringify(body),
    });
  } catch {
    throw new LimoSmsError("اتصال به سرور لیمو اس‌ام‌اس برقرار نشد");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new LimoSmsError(
      (data && typeof data.Message === "string" && data.Message) ||
        `درخواست به لیمو اس‌ام‌اس ناموفق بود (${response.status})`,
    );
  }
  if (data.Success === false) {
    throw new LimoSmsError(typeof data.Message === "string" ? data.Message : "درخواست ناموفق بود");
  }
  return data;
}

export async function limoSendSms(
  apiKey: string,
  params: { senderNumber: string; message: string; mobileNumbers: string[] },
) {
  const data = await callLimo("sendsms", apiKey, {
    Message: params.message,
    SenderNumber: params.senderNumber,
    MobileNumber: params.mobileNumbers,
    SendToBlocksNumber: false,
  });
  return data as { Success: boolean; Message: string; MessageId: string[] };
}

export async function limoGetCurrentCredit(apiKey: string) {
  const data = await callLimo("getcurrentcredit", apiKey, undefined);
  return data as { Success: boolean; Message: string; Result: unknown };
}
