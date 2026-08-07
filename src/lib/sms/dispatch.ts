import { prisma } from "@/lib/db";
import { limoSendSms } from "./limosms-client";

function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

// Fires every active SmsTrigger matching eventKey to `phone`. Never throws —
// this is called from core flows (payment callback, lead creation) that
// must not break if SMS is unconfigured or the LimoSMS request fails.
export async function dispatchSmsTrigger(
  eventKey: string,
  phone: string,
  vars: Record<string, string> = {},
) {
  try {
    const settings = await prisma.smsSettings.findUnique({ where: { id: 1 } });
    if (!settings?.enabled || !settings.apiKey || !settings.senderNumber) return;

    const triggers = await prisma.smsTrigger.findMany({ where: { eventKey, active: true } });
    if (triggers.length === 0) return;

    for (const trigger of triggers) {
      await limoSendSms(settings.apiKey, {
        senderNumber: settings.senderNumber,
        message: renderTemplate(trigger.message, vars),
        mobileNumbers: [phone],
      });
    }
  } catch (err) {
    console.error(`[sms:dispatch] trigger dispatch failed for ${eventKey}:`, err);
  }
}
