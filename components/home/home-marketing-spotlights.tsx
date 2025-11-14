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
    <Section size="lg" className="flex flex-col fluid-stack-lg">
      <div className="flex flex-col text-center fluid-stack-xs">
        <p className="font-semibold uppercase tracking-[0.35em] text-muted-foreground fluid-caption">
          {section.emoji ?? "🔥"} {section.title}
        </p>
        {section.subtitle ? (
          <p className="text-muted-foreground fluid-copy">{section.subtitle}</p>
        ) : null}
      </div>

      <div className="grid fluid-stack-md md:grid-cols-3">
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
      <CardContent className="flex flex-1 flex-col fluid-stack-sm p-5">
        <div className="flex flex-wrap items-center fluid-stack-2xs">
          <Badge variant="outline" className={`rounded-full font-semibold fluid-caption ${badgeTone}`}>
            {spotlight.badgeLabel ?? "Specjalna oferta"}
          </Badge>
          {discountLabel ? (
            <span className="inline-flex items-center fluid-stack-2xs rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary fluid-caption">
              <Percent className="h-3 w-3" />
              {discountLabel}
            </span>
          ) : null}
        </div>
        <div className="flex items-center fluid-stack-sm">
          {spotlight.company?.logoUrl ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border/30 bg-card">
              <Image src={spotlight.company.logoUrl} alt={spotlight.company.name} fill sizes="40px" className="object-contain" />
            </div>
          ) : null}
          <div className="flex flex-col fluid-stack-2xs">
            <p className="font-semibold text-foreground fluid-copy">{spotlight.title}</p>
            <p className="text-muted-foreground fluid-caption line-clamp-2">
              {spotlight.headline ?? spotlight.company?.name ?? "Sprawdź szczegóły"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center text-muted-foreground fluid-stack-xs fluid-caption">
          <span className="inline-flex items-center fluid-stack-2xs">
            <Star className="h-3 w-3 text-amber-500" />
            {ratingLabel}
          </span>
          <span>{ratingCount}</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/30 p-4">
        <div className="font-semibold text-foreground fluid-copy">{spotlight.company?.name ?? "Oferta"}</div>
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
