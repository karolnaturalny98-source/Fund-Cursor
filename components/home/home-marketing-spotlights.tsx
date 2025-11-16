import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Percent, Star } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { SurfaceCard } from "@/components/layout/surface-card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <Section size="lg" className="flex flex-col gap-8">
      <SectionHeader
        eyebrow={`${section.emoji ?? "🔥"} spotlight`}
        title={section.title}
        description={section.subtitle ?? "Personalizowane oferty i kody cashbacku przygotowane z partnerami FR."}
        eyebrowTone="accent"
      />

      <div className="rounded-[32px] border border-white/5 bg-[#080808] p-6">
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
      className="flex h-full flex-col justify-between gap-5 border border-white/10 bg-[#0b0b0b] hover:border-white/30"
    >
      <div className="flex flex-col fluid-stack-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`rounded-full font-semibold fluid-caption ${badgeTone}`}>
            {spotlight.badgeLabel ?? "Specjalna oferta"}
          </Badge>
          {discountLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary fluid-caption">
              <Percent className="h-3 w-3" />
              {discountLabel}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {spotlight.company?.logoUrl ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-[#050505]">
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
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500" />
            {ratingLabel}
          </span>
          <span>{ratingCount}</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/30 pt-4">
        <div className="font-semibold text-foreground fluid-copy">{spotlight.company?.name ?? "Oferta"}</div>
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
