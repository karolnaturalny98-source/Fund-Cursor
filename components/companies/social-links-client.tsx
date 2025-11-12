"use client";

import Link from "next/link";
import { ExternalLink, BookOpen } from "lucide-react";
import { PremiumIcon } from "@/components/custom/premium-icon";

interface SocialLink {
  key: string;
  url: string;
  label: string;
}

interface SocialLinksClientProps {
  socialLinks: SocialLink[];
  tosUrl: string | null;
}

export function SocialLinksClient({ socialLinks, tosUrl }: SocialLinksClientProps) {
  if (!socialLinks.length && !tosUrl) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      {socialLinks.map((entry) => (
        <Link
          key={entry.key}
          href={entry.url}
          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-[rgba(12,14,18,0.6)] !backdrop-blur-[36px] px-3 py-1 transition-all duration-200 hover:border-primary/50 hover:shadow-sm"
          target="_blank"
          rel="noreferrer"
        >
          <PremiumIcon icon={ExternalLink} variant="glow" size="sm" />
          {entry.label}
        </Link>
      ))}
      {tosUrl ? (
        <Link
          href={tosUrl}
          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-[rgba(12,14,18,0.6)] !backdrop-blur-[36px] px-3 py-1 transition-all duration-200 hover:border-primary/50 hover:shadow-sm"
          target="_blank"
          rel="noreferrer"
        >
          <PremiumIcon icon={BookOpen} variant="glow" size="sm" />
          Regulamin / ToS
        </Link>
      ) : null}
    </div>
  );
}

