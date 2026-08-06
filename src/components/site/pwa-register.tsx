"use client";

import { useEffect } from "react";

// Registers the service worker app-wide. A registered SW with a fetch
// handler is required for Chrome/Android's "Add to Home Screen" install
// prompt, and it's also what receives Web Push events (see public/sw.js).
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installability and push just won't be available — not worth
      // surfacing to the visitor, the rest of the site works fine.
    });
  }, []);

  return null;
}
