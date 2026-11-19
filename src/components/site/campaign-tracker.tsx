"use client";

import { useEffect } from "react";
import { getOrCreateSessionId } from "@/lib/session-id";

function track(body: Record<string, unknown>) {
  try {
    const payload = JSON.stringify(body);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/campaigns/track", new Blob([payload], { type: "application/json" }));
    } else {
      void fetch("/api/campaigns/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
    }
  } catch {
    // Tracking must never break the page.
  }
}

// Mounted once on a product landing page (course/tool detail). Fires:
// - page_view immediately
// - dwell_10s if the visitor is still around after 10 seconds
// - section_focus on page-leave, for whichever [data-campaign-section]
//   element accumulated the most visible time (a cheap stand-in for a
//   real heatmap — good enough to tell "did they read the price box or
//   never scroll past the video").
export function CampaignTracker({ productKey, campaignSlug }: { productKey: string; campaignSlug?: string }) {
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    const base = { productKey, campaignSlug, sessionId };

    track({ ...base, type: "page_view" });

    const dwellTimer = setTimeout(() => track({ ...base, type: "dwell_10s" }), 10_000);

    const visibleSince = new Map<string, number>();
    const accumulated = new Map<string, number>();
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-campaign-section]"));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const name = entry.target.getAttribute("data-campaign-section");
          if (!name) continue;
          if (entry.isIntersecting) {
            visibleSince.set(name, Date.now());
          } else {
            const since = visibleSince.get(name);
            if (since) {
              accumulated.set(name, (accumulated.get(name) ?? 0) + (Date.now() - since));
              visibleSince.delete(name);
            }
          }
        }
      },
      { threshold: 0.4 },
    );
    sections.forEach((el) => observer.observe(el));

    function flushSectionFocus() {
      for (const [name, since] of visibleSince) {
        accumulated.set(name, (accumulated.get(name) ?? 0) + (Date.now() - since));
      }
      let topSection: string | null = null;
      let topTime = 0;
      for (const [name, time] of accumulated) {
        if (time > topTime) {
          topTime = time;
          topSection = name;
        }
      }
      if (topSection && topTime > 1000) {
        track({ ...base, type: "section_focus", section: topSection });
      }
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushSectionFocus();
    });
    window.addEventListener("pagehide", flushSectionFocus);

    return () => {
      clearTimeout(dwellTimer);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
