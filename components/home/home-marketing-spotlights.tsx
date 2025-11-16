import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Percent, Star } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { SurfaceCard } from "@/components/layout/surface-card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import type { MarketingSpotlight, MarketingSpotlightSection } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HomeMarketingSpotlightsProps {
  section: MarketingSpotlightSection | null;
}

export function HomeMarketingSpotlights({ section }: HomeMarketingSpotlightsProps) {
  if (!section || !section.spotlights?.length) {
    return null;
  }

  return (
    <Section size="lg" stack="lg">
      <SectionHeader
        eyebrow={`${section.emoji ?? "🔥"} spotlight`}
        title={section.title}
        description={section.subtitle ?? "Personalizowane oferty i kody cashbacku przygotowane z partnerami FR."}
        eyebrowTone="accent"
      />

    <div className="rounded-[32px] border border-border/40 bg-[var(--surface-muted)]/70 p-6">
        <div className="grid gap-6 md:grid-cols-3">
          {section.spotlights.slice(0, 6).map((spotlight) => (
            <SpotlightCard key={spotlight.id} spotlight={spotlight} />
          ))}
        </div>
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
    <SurfaceCard
      variant="glass"
      padding="md"
      className="flex h-full flex-col justify-between gap-5 border border-border/40 bg-[var(--surface-muted)]/80 hover:border-primary/40"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("rounded-full text-[0.7rem] font-semibold", badgeTone)}>
            {spotlight.badgeLabel ?? "Specjalna oferta"}
          </Badge>
          {discountLabel ? (
            <Text
              asChild
              variant="caption"
              tone="primary"
              weight="semibold"
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5"
            >
              <span>
                <Percent className="h-3 w-3" />
                {discountLabel}
              </span>
            </Text>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {spotlight.company?.logoUrl ? (
          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border/40 bg-[var(--surface-base)]">
              <Image src={spotlight.company.logoUrl} alt={spotlight.company.name} fill sizes="40px" className="object-contain" />
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Text variant="body" weight="semibold" className="text-foreground">
              {spotlight.title}
            </Text>
            <Text variant="caption" tone="muted" className="line-clamp-2">
              {spotlight.headline ?? spotlight.company?.name ?? "Sprawdź szczegóły"}
            </Text>
          </div>
        </div>
        <Text asChild variant="caption" tone="muted" className="flex flex-wrap items-center gap-3 text-muted-foreground">
          <div>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500" />
              {ratingLabel}
            </span>
            <span className="ml-3">{ratingCount}</span>
          </div>
        </Text>
      </div>
      <div className="flex items-center justify-between border-t border-border/30 pt-4">
        <Text variant="body" weight="semibold" className="text-foreground">
          {spotlight.company?.name ?? "Oferta"}
        </Text>
        {spotlight.ctaUrl ? (
          <Link
            href={spotlight.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1 text-white",
            )}
          >
            {spotlight.ctaLabel ?? "Sprawdź"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </SurfaceCard>
  );
}

function getBadgeTone(tone?: string | null) {
  switch (tone) {
    case "violet":
      return "border-violet-400/30 text-violet-200";
    case "emerald":
      return "border-emerald-400/30 text-emerald-200";
    case "orange":
      return "border-orange-400/30 text-orange-200";
    default:
      return "border-[color-mix(in_srgb,var(--surface-ring)_75%,white_25%)] text-[var(--surface-ring)]";
  }
}
