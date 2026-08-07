import "server-only";
import webpush from "web-push";
import { prisma } from "@/lib/db";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  if (!publicKey || !privateKey) {
    throw new Error("VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY تنظیم نشده‌اند");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

type PushSub = { endpoint: string; p256dh: string; auth: string };

// Shared by broadcastPush/sendPushToUsers: sends to every given
// subscription and prunes ones the push service reports as gone (410/404
// — the user uninstalled, cleared data, or revoked permission), so the
// table doesn't accumulate dead endpoints.
async function sendToSubscriptions(subscriptions: PushSub[], payload: { title: string; body: string; url?: string }) {
  ensureConfigured();
  const data = JSON.stringify(payload);

  let sent = 0;
  let failed = 0;
  const deadEndpoints: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          data,
        );
        sent += 1;
      } catch (err) {
        failed += 1;
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          deadEndpoints.push(sub.endpoint);
        }
      }
    }),
  );

  if (deadEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: deadEndpoints } } });
  }

  return { sent, failed, total: subscriptions.length };
}

export async function broadcastPush(payload: { title: string; body: string; url?: string }) {
  const subscriptions = await prisma.pushSubscription.findMany();
  return sendToSubscriptions(subscriptions, payload);
}

// Marketing sends: only the subset of subscribed devices belonging to the
// given (segment-filtered) user ids.
export async function sendPushToUsers(
  userIds: string[],
  payload: { title: string; body: string; url?: string },
) {
  if (userIds.length === 0) return { sent: 0, failed: 0, total: 0 };
  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId: { in: userIds } } });
  return sendToSubscriptions(subscriptions, payload);
}
