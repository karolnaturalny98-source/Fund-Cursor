"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

interface CopyDiscountButtonProps {
  code: string;
  slug: string;
  onCopied?: () => void;
}

export function CopyDiscountButton({
  code,
  slug,
  onCopied,
}: CopyDiscountButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      const payload = JSON.stringify({ companySlug: slug, source: "copy_code" });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/clicks", payload);
      } else {
        fetch("/api/clicks", {
          method: "POST",
          body: payload,
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
          },
        }).catch(() => {
          // best effort logging
        });
      }
      onCopied?.();
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Clipboard error", error);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? "Skopiowano" : "Kopiuj"}
    </Button>
  );
}
