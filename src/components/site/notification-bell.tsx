"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

type Status = "unsupported" | "loading" | "subscribed" | "unsubscribed" | "denied";

// A single bell toggle, reused in the desktop navbar and the mobile "more"
// sheet. Subscribing doesn't require login — anonymous visitors can opt in,
// see src/app/api/push/subscribe/route.ts.
export function NotificationBell({ className }: { className?: string }) {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      const registration = await navigator.serviceWorker.ready.catch(() => null);
      const sub = await registration?.pushManager.getSubscription().catch(() => null);
      setStatus(sub ? "subscribed" : "unsubscribed");
    }
    check();
  }, []);

  async function subscribe() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return;
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "unsubscribed");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      setStatus("subscribed");
    } catch {
      setStatus("unsubscribed");
    }
  }

  async function unsubscribe() {
    setStatus("loading");
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("unsubscribed");
    } catch {
      setStatus("subscribed");
    }
  }

  if (status === "unsupported") return null;

  const isSubscribed = status === "subscribed";
  const isBusy = status === "loading";

  return (
    <button
      type="button"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isBusy || status === "denied"}
      aria-label={isSubscribed ? "غیرفعال‌سازی اعلان‌ها" : "فعال‌سازی اعلان‌ها"}
      title={
        status === "denied"
          ? "اعلان‌ها در تنظیمات مرورگر مسدود شده‌اند"
          : isSubscribed
            ? "اعلان‌ها فعال است"
            : "فعال‌سازی اعلان‌ها"
      }
      className={
        className ??
        "flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50"
      }
    >
      {isSubscribed ? <Bell size={16} /> : <BellOff size={16} />}
    </button>
  );
}
