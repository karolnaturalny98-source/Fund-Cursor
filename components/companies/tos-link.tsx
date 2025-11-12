"use client";

import { Button } from "@/components/ui/button";

interface TosLinkProps {
  href: string;
  companySlug: string;
  children: React.ReactNode;
}

export function TosLink({ href, companySlug, children }: TosLinkProps) {
  function handleClick() {
    const payload = JSON.stringify({
      companySlug,
      source: "open_tos",
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/clicks", payload);
    } else {
      fetch("/api/clicks", {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {
        // best effort logging
      });
    }
  }

  return (
    <Button
      asChild
      variant="link"
      className="inline-flex items-center text-xs font-medium text-primary h-auto p-0"
    >
      <a href={href} onClick={handleClick} rel="noreferrer" target="_blank">
        {children}
      </a>
    </Button>
  );
}
