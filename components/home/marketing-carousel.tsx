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
        "group relative w-full max-w-[200px] md:max-w-[240px] mx-auto",
        "aspect-3/4 overflow-hidden",
        "border-gradient-premium glass-card transition-all duration-500",
        "hover:scale-105 hover:shadow-premium-lg hover:border-gradient-premium",
        "flex flex-col"
      )}
    >
      {/* Discount Badge - HERO ELEMENT */}
      {hasDiscount && (
        <CardHeader className="p-3 pb-0">
          <div className="relative flex flex-col items-center justify-center h-16 md:h-20 rounded-lg bg-linear-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-50" />
            <div className="relative z-10 text-center">
              <div className="text-4xl md:text-5xl font-black text-primary leading-none text-shadow-glow">
                {spotlight.discountValue}%
              </div>
              <span className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                rabatu
              </span>
            </div>
          </div>
        </CardHeader>
      )}

      {/* Content */}
      <CardContent className={cn(
        "flex-1 flex flex-col justify-between gap-2 md:gap-3",
        hasDiscount ? "p-3 pt-2" : "p-3"
      )}>
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 shadow-xs">
            {spotlight.company?.logoUrl ? (
              <Image
                src={spotlight.company.logoUrl}
                alt={`Logo ${spotlight.company.name}`}
                width={40}
                height={40}
                className="h-8 w-8 md:h-10 md:w-10 rounded-md object-contain"
              />
            ) : (
              <span className="text-[10px] md:text-xs font-semibold text-primary">
                {getInitials(spotlight.company?.name ?? spotlight.title)}
              </span>
            )}
          </div>
        </div>

        {/* Text Section */}
        <div className="flex flex-col items-center gap-1 text-center">
          {/* Company name + Badge */}
          <div className="flex flex-wrap items-center justify-center gap-1">
            <span className="text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {spotlight.company?.name ?? "Specjalna oferta"}
            </span>
            {spotlight.badgeLabel && (
              <div
                className={cn(
                  "inline-flex shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-lg transition",
                  ...toneClassNames,
                )}
                style={toneStyle}
              >
                {spotlight.badgeLabel}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm md:text-base font-semibold text-foreground leading-tight line-clamp-2">
            {spotlight.title}
          </h3>

          {/* Headline */}
          {spotlight.headline && (
            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
              {spotlight.headline}
            </p>
          )}
        </div>

        {/* Rating Badge */}
        {spotlight.rating !== null && spotlight.rating !== undefined && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[10px]">
              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400 shrink-0" />
              <span className="font-semibold text-foreground">
                {spotlight.rating.toFixed(1)}
              </span>
              {spotlight.ratingCount && (
                <span className="text-muted-foreground/70 text-[9px]">
                  ({spotlight.ratingCount.toLocaleString("pl-PL")})
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* CTA Button */}
      <CardFooter className="p-3 pt-0">
        {spotlight.ctaUrl ? (
          <Button
            asChild
            variant="premium"
            className="w-full rounded-full text-[10px] md:text-xs font-semibold h-8 md:h-9"
          >
            <Link href={spotlight.ctaUrl} target="_blank" rel="noreferrer">
              {spotlight.ctaLabel ?? "Sprawdź ofertę"}
            </Link>
          </Button>
        ) : (
          <Badge variant="outline" className="w-full justify-center rounded-full border-primary/20 px-3 py-1.5 text-[10px]">
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
    <section className="relative overflow-hidden border-y border-border/40">
      <div className="absolute inset-0 bg-linear-to-b from-secondary/10 via-secondary/5 to-transparent backdrop-blur-[36px]!" />
      <div className="container relative z-10 space-y-6 md:space-y-8 py-8 md:py-12">
        {/* Section Header */}
        <div className="flex justify-center">
          <div className="inline-flex items-center border font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wider">
            Promocje specjalne
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {spotlights.map((spotlight) => (
            <MarketingCard key={spotlight.id} spotlight={spotlight} />
          ))}
        </div>
      </div>
    </section>
  );
}


