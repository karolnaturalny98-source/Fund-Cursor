"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";

import type { ReviewsRankingItem } from "@/lib/queries/reviews";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Button } from "@/components/ui/button";
import {
  ScoreBadge,
  TrendPill,
  formatTrend,
  getScoreBadgeClasses,
} from "@/components/reviews/reviews-ranking-table";
import { cn } from "@/lib/utils";

interface ReviewsRankingMobileListProps {
  items: ReviewsRankingItem[];
  maxReviews: number;
  loading?: boolean;
}

export function ReviewsRankingMobileList({
  items,
  maxReviews,
  loading = false,
}: ReviewsRankingMobileListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-6 text-center text-sm text-muted-foreground shadow-xs">
        Brak firm spelniajacych wybrane kryteria.
      </div>
    );
  }

  return (
    <div className="relative">
      {loading ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-card/72 backdrop-blur-sm">
          <div className="h-[clamp(1.1rem,0.45vw+1rem,1.25rem)] w-[clamp(1.1rem,0.45vw+1rem,1.25rem)] animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : null}
      <div className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
        {items.map((item, index) => (
          <RankingCard
            key={item.companyId}
            item={item}
            position={index + 1}
            maxReviews={maxReviews}
          />
        ))}
      </div>
    </div>
  );
}

function RankingCard({
  item,
  position,
  maxReviews,
}: {
  item: ReviewsRankingItem;
  position: number;
  maxReviews: number;
}) {
  const progress =
    maxReviews > 0 ? Math.max(0, Math.min(1, item.totalReviews / maxReviews)) : 0;
  const trend = formatTrend(item.trendRatio);
  const overall = item.averageRating ?? 0;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-[clamp(1.2rem,1.8vw,1.6rem)] shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]">
      <div className="flex items-start justify-between gap-[clamp(0.65rem,0.95vw,0.9rem)]">
        <div className="flex flex-1 items-center gap-[clamp(0.75rem,1vw,0.95rem)]">
          <span className="flex h-[clamp(2.35rem,1.8vw+1.9rem,2.7rem)] w-[clamp(2.35rem,1.8vw+1.9rem,2.7rem)] items-center justify-center rounded-full border border-border/60 bg-muted text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-semibold text-muted-foreground">
            #{position}
          </span>
          <div className="flex flex-col gap-[clamp(0.3rem,0.45vw,0.4rem)]">
            <Link
              href={`/firmy/${item.companySlug}`}
              prefetch={false}
              className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold text-foreground transition-colors hover:text-primary"
            >
              {item.companyName}
            </Link>
            <span className="fluid-caption text-muted-foreground">
              {item.totalReviews.toLocaleString("pl-PL")} opinii |{" "}
              {item.favoritesCount.toLocaleString("pl-PL")} obserwujacych
            </span>
          </div>
        </div>
        <PremiumBadge
          variant="glow"
          className={cn(
            "px-3 py-1 text-sm font-semibold",
            getScoreBadgeClasses(overall),
          )}
          aria-label={`Srednia ocena: ${overall.toFixed(1)} / 5`}
        >
          <PremiumIcon icon={Star} variant="glow" size="sm" className="mr-1" />
          {overall.toFixed(1)}
        </PremiumBadge>
      </div>

      <div className="mt-[clamp(0.75rem,1.1vw,1rem)]">
        <div className="h-[clamp(0.35rem,0.5vw,0.45rem)] w-full rounded-full bg-muted/70">
          <div
            className="h-full rounded-full bg-primary/80 transition-[width] w-[var(--progress-width)]"
            style={{ "--progress-width": `${Math.max(progress * 100, progress > 0 ? 8 : 0)}%` } as React.CSSProperties}
          />
        </div>
        <p className="mt-[clamp(0.2rem,0.35vw,0.3rem)] fluid-caption text-muted-foreground">
          {item.newReviews30d.toLocaleString("pl-PL")} nowych opinii w 30 dni
        </p>
      </div>

      <dl className="mt-[clamp(0.85rem,1.2vw,1.1rem)] grid grid-cols-2 gap-[clamp(0.65rem,1vw,0.9rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)]">
        <div className="space-y-[clamp(0.3rem,0.45vw,0.4rem)]">
          <dt className="fluid-caption uppercase tracking-[0.28em] text-muted-foreground">
            Warunki
          </dt>
          <dd>
            <ScoreBadge value={item.categories.tradingConditions} label="Warunki" />
          </dd>
        </div>
        <div className="space-y-[clamp(0.3rem,0.45vw,0.4rem)]">
          <dt className="fluid-caption uppercase tracking-[0.28em] text-muted-foreground">
            Obsluga
          </dt>
          <dd>
            <ScoreBadge value={item.categories.customerSupport} label="Obsluga" />
          </dd>
        </div>
        <div className="space-y-[clamp(0.3rem,0.45vw,0.4rem)]">
          <dt className="fluid-caption uppercase tracking-[0.28em] text-muted-foreground">
            Doswiadczenie
          </dt>
          <dd>
            <ScoreBadge value={item.categories.userExperience} label="Doswiadczenie" />
          </dd>
        </div>
        <div className="space-y-[clamp(0.3rem,0.45vw,0.4rem)]">
          <dt className="fluid-caption uppercase tracking-[0.28em] text-muted-foreground">
            Wyplaty
          </dt>
          <dd>
            <ScoreBadge value={item.categories.payoutExperience} label="Wyplaty" />
          </dd>
        </div>
      </dl>

      <div className="mt-[clamp(0.85rem,1.2vw,1.1rem)] flex flex-wrap items-center gap-[clamp(0.55rem,0.85vw,0.8rem)] text-muted-foreground fluid-caption">
        <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
          <span className="text-muted-foreground/80">Trend</span>
          <TrendPill trend={trend} />
        </div>
        <span>Nowe opinie: {item.newReviews30d.toLocaleString("pl-PL")}</span>
      </div>

      <Button
        asChild
        variant="premium-outline"
        className="mt-[clamp(1rem,1.4vw,1.25rem)] w-full justify-center rounded-full"
      >
        <Link href={`/firmy/${item.companySlug}#opinie`} prefetch={false}>
          Zobacz opinie
          <PremiumIcon
            icon={ArrowUpRight}
            variant="glow"
            size="sm"
            className="ml-[clamp(0.35rem,0.55vw,0.5rem)]"
            hoverGlow
          />
        </Link>
      </Button>
    </article>
  );
}
