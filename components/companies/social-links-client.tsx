"use client";

import Link from "next/link";
import { ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { cn } from "@/lib/utils";

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
        <Button
          key={entry.key}
          asChild
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full border-border/60 bg-background/60 backdrop-blur-[36px]!",
            "hover:border-primary/50 hover:shadow-xs"
          )}
        >
          <Link href={entry.url} target="_blank" rel="noreferrer">
            <PremiumIcon icon={ExternalLink} variant="glow" size="sm" />
            {entry.label}
          </Link>
        </Button>
      ))}
      {tosUrl ? (
        <Button
          asChild
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full border-border/60 bg-background/60 backdrop-blur-[36px]!",
            "hover:border-primary/50 hover:shadow-xs"
          )}
        >
          <Link href={tosUrl} target="_blank" rel="noreferrer">
            <PremiumIcon icon={BookOpen} variant="glow" size="sm" />
            Regulamin / ToS
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

