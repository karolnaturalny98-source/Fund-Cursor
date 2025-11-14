import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Percent, Star } from "lucide-react";

import { Section } from "@/components/layout/section";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MarketingSpotlight, MarketingSpotlightSection } from "@/lib/types";

interface HomeMarketingSpotlightsProps {
  section: MarketingSpotlightSection | null;
}

export function HomeMarketingSpotlights({ section }: HomeMarketingSpotlightsProps) {
  if (!section || !section.spotlights?.length) {
    return null;
  }

  return (
    <Section size="lg" className="space-y-6">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          {section.emoji ?? "🔥"} {section.title}
        </p>
        {section.subtitle ? (
          <p className="text-sm text-muted-foreground">{section.subtitle}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {section.spotlights.slice(0, 6).map((spotlight) => (
          <SpotlightCard key={spotlight.id} spotlight={spotlight} />
        ))}
      </div>
    </Section>
  );
}

function SpotlightCard({ spotlight }: { spotlight: MarketingSpotlight }) {
  const ratingLabel = spotlight.rating
    ? `${spotlight.rating.toFixed(1)} / 5`
    : "Brak ocen";
  const ratingCount = spotlight.ratingCount ? `${spotlight.ratingCount} opinii` : "nowość";
  const discountLabel = typeof spotlight.discountValue === "number" ? `${spotlight.discountValue}%` : null;
  const badgeTone = getBadgeTone(spotlight.badgeTone);

  return (
    <Card className="flex h-full flex-col border border-border/40 bg-background/80 shadow-sm transition hover:border-primary/40">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`rounded-full text-xs font-semibold ${badgeTone}`}>
            {spotlight.badgeLabel ?? "Specjalna oferta"}
          </Badge>
          {discountLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              <Percent className="h-3 w-3" />
              {discountLabel}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {spotlight.company?.logoUrl ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border/30 bg-card">
              <Image src={spotlight.company.logoUrl} alt={spotlight.company.name} fill sizes="40px" className="object-contain" />
            </div>
          ) : null}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">{spotlight.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {spotlight.headline ?? spotlight.company?.name ?? "Sprawdź szczegóły"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500" />
            {ratingLabel}
          </span>
          <span>{ratingCount}</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/30 p-4">
        <div className="text-sm font-semibold text-foreground">{spotlight.company?.name ?? "Oferta"}</div>
        {spotlight.ctaUrl ? (
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href={spotlight.ctaUrl} target="_blank" rel="noopener noreferrer">
              {spotlight.ctaLabel ?? "Sprawdź"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}

function getBadgeTone(tone?: string | null) {
  switch (tone) {
    case "violet":
      return "border-violet-400/30 text-violet-600";
    case "emerald":
      return "border-emerald-400/30 text-emerald-600";
    case "orange":
      return "border-orange-400/30 text-orange-600";
    default:
      return "border-primary/40 text-primary";
  }
}
