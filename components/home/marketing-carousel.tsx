"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import type { MarketingSpotlight, MarketingSpotlightSection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Section } from "@/components/layout/section";
import { cn } from "@/lib/utils";

interface MarketingCarouselProps {
  section: MarketingSpotlightSection | null;
}

const gradientBadgeTones: Record<string, string> = {
  pink: "from-[#F472B6] via-[#EC4899] to-[#DB2777] text-white",
  violet: "from-[#C084FC] via-[#A855F7] to-[#7C3AED] text-white",
  sky: "from-[#67E8F9] via-[#38BDF8] to-[#0EA5E9] text-slate-900",
  emerald: "from-[#6EE7B7] via-[#34D399] to-[#10B981] text-slate-900",
  amber: "from-[#FDE68A] via-[#FBBF24] to-[#F59E0B] text-slate-900",
  teal: "from-[#5EEAD4] via-[#2DD4BF] to-[#14B8A6] text-slate-900",
  rose: "from-[#FDA4AF] via-[#FB7185] to-[#F43F5E] text-white",
  indigo: "from-[#C7D2FE] via-[#818CF8] to-[#4338CA] text-white",
  slate: "from-[#E2E8F0] via-[#94A3B8] to-[#475569] text-white",
};

const solidBadgeTones: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  gray: "bg-slate-200 text-slate-900",
};

interface BadgeToneProps {
  classNames: string[];
  style?: CSSProperties;
}

const HEX_COLOR = /^#(?:[0-9a-f]{3}){1,2}$/i;
const LINEAR_GRADIENT = /^linear-gradient/i;

function isLight(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => char + char)
        .join("")
    : normalized;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

function getBadgeToneProps(tone?: string | null): BadgeToneProps {
  if (!tone) {
    return { classNames: ["bg-linear-to-r", gradientBadgeTones.pink] };
  }

  const trimmed = tone.trim();
  const normalized = trimmed.toLowerCase();

  if (gradientBadgeTones[normalized]) {
    return { classNames: ["bg-linear-to-r", gradientBadgeTones[normalized]] };
  }

  if (solidBadgeTones[normalized]) {
    return { classNames: [solidBadgeTones[normalized]] };
  }

  if (HEX_COLOR.test(trimmed)) {
    return {
      classNames: [isLight(trimmed) ? "text-slate-900" : "text-white"],
      style: { background: trimmed },
    };
  }

  if (LINEAR_GRADIENT.test(trimmed)) {
    return {
      classNames: ["text-white"],
      style: { background: trimmed },
    };
  }

  return { classNames: ["bg-linear-to-r", gradientBadgeTones.pink] };
}

function getInitials(name: string | undefined | null) {
  if (!name) return "FR";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function MarketingCard({ spotlight }: { spotlight: MarketingSpotlight }) {
  const toneProps = spotlight.badgeLabel ? getBadgeToneProps(spotlight.badgeTone) : null;
  const toneClassNames = toneProps?.classNames ?? [];
  const toneStyle = toneProps?.style;
  const hasDiscount = spotlight.discountValue !== null && spotlight.discountValue !== undefined;

  return (
    <Card
      className={cn(
        "group relative z-10 mx-auto flex h-full w-full max-w-[clamp(12rem,24vw,15rem)] flex-col",
        "min-h-[clamp(20rem,30vw,24rem)]",
        "border-gradient-premium glass-card overflow-visible transition-all duration-500",
        "hover:scale-105 hover:shadow-premium-lg hover:border-gradient-premium",
      )}
    >
      {/* Discount Badge - HERO ELEMENT */}
      {hasDiscount && (
        <CardHeader className="p-[clamp(0.9rem,1.5vw,1.15rem)] pb-0">
          <div className="relative flex h-[clamp(4rem,5vw+3rem,5.5rem)] flex-col items-center justify-center overflow-hidden rounded-lg border border-primary/30 bg-linear-to-br from-primary/20 via-primary/10 to-transparent shadow-lg">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-50" />
            <div className="relative z-10 text-center">
              <div className="text-[clamp(2.5rem,4vw+1.75rem,3.25rem)] font-black leading-none text-primary text-shadow-glow">
                {spotlight.discountValue}%
              </div>
              <span className="text-[clamp(0.65rem,0.3vw+0.55rem,0.8rem)] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                rabatu
              </span>
            </div>
          </div>
        </CardHeader>
      )}

      {/* Content */}
      <CardContent
        className={cn(
          "flex flex-1 flex-col fluid-stack-sm",
          hasDiscount ? "px-[clamp(0.85rem,1.5vw,1.15rem)] pb-[clamp(0.75rem,1.3vw,1rem)] pt-[clamp(0.5rem,1vw,0.75rem)]" : "p-[clamp(0.85rem,1.5vw,1.15rem)]",
        )}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex h-[clamp(2.4rem,2.5vw+1.9rem,3.25rem)] w-[clamp(2.4rem,2.5vw+1.9rem,3.25rem)] shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 shadow-xs">
            {spotlight.company?.logoUrl ? (
              <Image
                src={spotlight.company.logoUrl}
                alt={`Logo ${spotlight.company.name}`}
                width={40}
                height={40}
                className="h-[clamp(1.8rem,1.6vw+1.35rem,2.4rem)] w-[clamp(1.8rem,1.6vw+1.35rem,2.4rem)] rounded-md object-contain"
              />
            ) : (
              <span className="text-[clamp(0.68rem,0.35vw+0.6rem,0.82rem)] font-semibold text-primary">
                {getInitials(spotlight.company?.name ?? spotlight.title)}
              </span>
            )}
          </div>
        </div>

        {/* Text Section */}
        <div className="flex flex-col items-center fluid-stack-2xs text-center">
          {/* Company name + Badge */}
          <div className="flex flex-wrap items-center justify-center fluid-stack-2xs">
            <span className="text-[clamp(0.65rem,0.3vw+0.55rem,0.78rem)] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {spotlight.company?.name ?? "Specjalna oferta"}
            </span>
            {spotlight.badgeLabel && (
              <div
                className={cn(
                  "inline-flex shrink-0 items-center justify-center rounded-full px-[clamp(0.65rem,1.1vw,0.85rem)] py-[clamp(0.2rem,0.6vw,0.35rem)] text-[clamp(0.6rem,0.3vw+0.5rem,0.75rem)] font-semibold shadow-lg transition",
                  ...toneClassNames,
                )}
                style={toneStyle}
              >
                {spotlight.badgeLabel}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[clamp(0.9rem,0.5vw+0.8rem,1.1rem)] font-semibold leading-tight text-foreground line-clamp-2">
            {spotlight.title}
          </h3>

          {/* Headline */}
          {spotlight.headline && (
            <p className="text-[clamp(0.65rem,0.3vw+0.55rem,0.8rem)] text-muted-foreground line-clamp-2 leading-relaxed">
              {spotlight.headline}
            </p>
          )}
        </div>

        {/* Rating Badge */}
        {spotlight.rating !== null && spotlight.rating !== undefined && (
          <div className="flex justify-center">
            <div className="inline-flex items-center fluid-stack-2xs rounded-full border border-primary/20 bg-primary/5 px-[clamp(0.55rem,1vw,0.75rem)] py-[clamp(0.25rem,0.6vw,0.4rem)] text-[clamp(0.62rem,0.3vw+0.52rem,0.75rem)]">
              <Star className="shrink-0" style={{ height: "clamp(0.65rem,0.4vw+0.55rem,0.85rem)", width: "clamp(0.65rem,0.4vw+0.55rem,0.85rem)" }} />
              <span className="font-semibold text-foreground">
                {spotlight.rating.toFixed(1)}
              </span>
              {spotlight.ratingCount && (
                <span className="text-muted-foreground/70 text-[clamp(0.58rem,0.25vw+0.5rem,0.7rem)]">
                  ({spotlight.ratingCount.toLocaleString("pl-PL")})
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* CTA Button */}
      <CardFooter className="relative z-20 mt-auto p-[clamp(0.75rem,1.2vw,1rem)] pt-0">
        {spotlight.ctaUrl ? (
          <Button
            asChild
            variant="premium"
            className="relative z-20 fluid-button-sm w-full rounded-full"
          >
            <Link href={spotlight.ctaUrl} target="_blank" rel="noreferrer">
              {spotlight.ctaLabel ?? "Sprawdź ofertę"}
            </Link>
          </Button>
        ) : (
          <Badge
            variant="outline"
            className="relative z-20 fluid-button-sm inline-flex w-full justify-center rounded-full border-primary/20"
          >
            {spotlight.ctaLabel ?? "Oferta limitowana"}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}

export function MarketingCarousel({ section }: MarketingCarouselProps) {
  const spotlights = useMemo(
    () => [...(section?.spotlights ?? [])].sort((a, b) => a.order - b.order),
    [section?.spotlights],
  );

  if (spotlights.length === 0) {
    return null;
  }

  return (
    <Section bleed size="lg" className="relative overflow-hidden border-y border-border/40">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-secondary/10 via-secondary/5 to-transparent backdrop-blur-[36px]!" />
      <div className="container relative z-10 flex flex-col fluid-stack-lg">
        {/* Section Header */}
        <div className="flex justify-center">
          <div className="inline-flex w-fit items-center rounded-full border font-semibold uppercase tracking-[0.28em] text-foreground transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 px-[clamp(0.75rem,1.5vw,1.1rem)] py-[clamp(0.35rem,0.8vw,0.55rem)] text-[clamp(0.68rem,0.3vw+0.58rem,0.78rem)]">
            Promocje specjalne
          </div>
        </div>

        {/* Grid Layout - zachować strukturę z płynniejszym skalowaniem */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] justify-items-center fluid-stack-md">
          {spotlights.map((spotlight) => (
            <MarketingCard key={spotlight.id} spotlight={spotlight} />
          ))}
        </div>
      </div>
    </Section>
  );
}


