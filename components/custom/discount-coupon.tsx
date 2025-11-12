"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscountCouponProps {
  code: string | null;
  slug: string;
  className?: string;
}

export function DiscountCoupon({
  code,
  slug,
  className,
}: DiscountCouponProps) {
  const [copied, setCopied] = useState(false);

  if (!code) {
    return (
      <span className={cn("text-xs text-muted-foreground/70", className)}>
        -
      </span>
    );
  }

  async function handleCopy() {
    try {
      if (!code) {
        return;
      }
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
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Clipboard error", error);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-xl border-gradient bg-gradient-card shadow-premium transition-all hover:border-gradient-premium hover:shadow-premium-lg",
        className,
      )}
      aria-label={`Skopiuj kod zniżkowy ${code}`}
    >
      {/* Top section with gradient */}
      <div className="bg-linear-to-r from-[#0F766E] via-[#14B8A6] to-[#3B82F6] px-3 py-2 text-center">
        <code className="font-mono text-xs font-bold text-white">
          {code}
        </code>
      </div>
      
      {/* Bottom section with action */}
      <div className="flex items-center justify-center gap-2 bg-[rgba(8,10,13,0.82)] px-3 py-2">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider text-white",
            "glitch-text",
          )}
        >
          {copied ? "Skopiowano" : "Kopiuj"}
        </span>
        <div className="relative h-3.5 w-3.5">
          {/* Bottom square */}
          <div className="absolute inset-0 rounded-[2px] bg-primary" />
          {/* Top square with offset */}
          <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-[2px] bg-primary/70" />
          {/* Icon */}
          <div className="relative z-10 flex h-full w-full items-center justify-center">
            <Copy className="h-1.5 w-1.5 text-white" />
          </div>
        </div>
      </div>
    </button>
  );
}

