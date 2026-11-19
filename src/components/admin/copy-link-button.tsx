"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be blocked (permissions, insecure context) —
      // the link is still visible in the row for manual copy either way.
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "کپی شد" : "کپی لینک"}
    </Button>
  );
}
