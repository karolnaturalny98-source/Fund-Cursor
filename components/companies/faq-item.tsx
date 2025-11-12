"use client";

import { useState } from "react";

interface FaqItemProps {
  id: string;
  question: string;
  answer: string;
  companySlug: string;
}

export function FaqItem({ id, question, answer, companySlug }: FaqItemProps) {
  const [logged, setLogged] = useState(false);

  function handleToggle(event: React.SyntheticEvent<HTMLDetailsElement>) {
    if (event.currentTarget.open && !logged) {
      const payload = JSON.stringify({
        companySlug,
        source: "faq_expand",
        faqId: id,
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
          // best effort telemetry
        });
      }
      setLogged(true);
    }
  }

  return (
    <details
      onToggle={handleToggle}
      className="group rounded-2xl border-gradient bg-gradient-card p-4 text-sm shadow-premium transition-all hover:border-gradient-premium hover:shadow-premium-lg"
    >
      <summary className="cursor-pointer list-none font-medium text-foreground">
        {question}
      </summary>
      <p className="mt-2 text-muted-foreground">{answer}</p>
    </details>
  );
}
