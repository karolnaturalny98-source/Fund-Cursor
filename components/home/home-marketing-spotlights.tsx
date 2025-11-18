import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Gift, Percent, Star } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { GlareCard } from "@/components/ui/glare-card";
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

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {section.spotlights.slice(0, 6).map((spotlight) => (
          <SpotlightCard key={spotlight.id} spotlight={spotlight} />
        ))}
      </div>
    </Section>
  );
}

function SpotlightCard({ spotlight }: { spotlight: MarketingSpotlight }) {
  const ratingLabel = spotlight.rating ? `${spotlight.rating.toFixed(1)} / 5` : "Brak ocen";
  const ratingCount = spotlight.ratingCount ? `${spotlight.ratingCount} opinii` : "nowość";
  const discountLabel =
    typeof spotlight.discountValue === "number" ? `${spotlight.discountValue}%` : null;
  const badgeTone = getBadgeTone(spotlight.badgeTone);
  const highlights = [
    spotlight.headline ?? spotlight.company?.name,
    spotlight.benefits?.[0],
    spotlight.benefits?.[1],
  ].filter(Boolean);

  return (
    <GlareCard className="flex h-full flex-col justify-between gap-5 rounded-3xl border border-white/10 bg-black p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn("rounded-full text-[0.7rem] font-semibold", badgeTone)}>
            {spotlight.badgeLabel ?? "Specjalna oferta"}
          </Badge>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Star className="h-3 w-3 text-amber-400" />
            {ratingLabel} • {ratingCount}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {spotlight.company?.logoUrl ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/20 bg-black/60">
              <Image src={spotlight.company.logoUrl} alt={spotlight.company.name} fill sizes="40px" className="object-contain" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-xs font-semibold uppercase text-white">
              {spotlight.company?.name?.slice(0, 2) ?? "FR"}
            </div>
          )}
          <div className="space-y-1">
            <Text variant="body" weight="semibold" className="text-white">
              {spotlight.title}
            </Text>
            <p className="text-xs text-white/60 line-clamp-2">{spotlight.headline ?? "Poznaj szczegóły"}</p>
          </div>
        </div>
        <ul className="space-y-1 text-xs text-white/70">
          {discountLabel ? (
            <li className="flex items-center gap-1">
              <Gift className="h-3.5 w-3.5 text-primary" />
              Kod {discountLabel}
            </li>
          ) : null}
          {highlights.slice(0, 2).map((highlight, index) => (
            <li key={`${highlight}-${index}`} className="flex items-center gap-1 text-white/70">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Firma</p>
          <p className="text-sm font-semibold text-white">
            {spotlight.company?.name ?? "Oferta FundedRank"}
          </p>
        </div>
        {spotlight.ctaUrl ? (
          <Link
            href={spotlight.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 rounded-full bg-white/10 px-4 text-white")}
          >
            {spotlight.ctaLabel ?? "Odbierz"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </GlareCard>
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
