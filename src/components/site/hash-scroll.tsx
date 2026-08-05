"use client";

import { useEffect } from "react";

// Nav links from other pages (/prompts, /courses, /blog/[slug]) point here
// as "/#ai-tools" etc. Next's own Link-triggered scroll-to-hash on a
// cross-page navigation is unreliable in this app — it can race the global
// `scroll-behavior: smooth` CSS and land at the top of the page instead of
// the target section. This retries the scroll explicitly after mount (and
// again shortly after, once any layout-shifting reveal animations have
// settled) so a menu click from any page reliably lands on the right
// section here.
export function HashScroll() {
  useEffect(() => {
    function scrollToHash() {
      const hash = window.location.hash;
      if (!hash) return;
      const el = document.getElementById(hash.slice(1));
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const t1 = setTimeout(scrollToHash, 50);
    const t2 = setTimeout(scrollToHash, 400);
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  return null;
}
