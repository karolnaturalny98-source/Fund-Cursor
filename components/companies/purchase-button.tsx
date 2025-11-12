"use client";

import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn, withTrackingParams } from "@/lib/utils";

interface PurchaseButtonProps {
  companySlug: string;
  href: string;
  children: React.ReactNode;
  planId?: string;
  className?: string;
  variant?: "premium" | "premium-outline";
}

export function PurchaseButton({
  companySlug,
  href,
  children,
  planId,
  className,
  variant = "premium",
}: PurchaseButtonProps) {
  const [isLogging, setIsLogging] = useState(false);
  const trackedUrl = useMemo(
    () =>
      withTrackingParams(href, {
        companySlug,
        planId,
      }),
    [companySlug, href, planId],
  );

  const handleClick = useCallback(() => {
    if (isLogging) {
      return;
    }

    setIsLogging(true);

    const payload = JSON.stringify({
      companySlug,
      source: planId ? `purchase_click:${planId}` : "purchase_click",
    });

    const blob = new Blob([payload], { type: "application/json" });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/clicks", blob);
    } else {
      fetch("/api/clicks", {
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
        keepalive: true,
      }).catch(() => {
        // Swallow error - logging is best effort
      });
    }

    window.open(trackedUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => setIsLogging(false), 500);
  }, [companySlug, isLogging, planId, trackedUrl]);

  return (
    <Button
      className={cn("w-full rounded-full", className)}
      type="button"
      variant={variant}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
