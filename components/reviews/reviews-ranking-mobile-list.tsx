"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";

import type { ReviewsRankingItem } from "@/lib/queries/reviews";
import { Badge } from "@/components/ui/badge";
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
      <div className="rounded-3xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] p-6 text-center text-sm text-muted-foreground shadow-sm">
        Brak firm spelniajacych wybrane kryteria.
      </div>
    );
  }

  return (
    <div className="relative">
      {loading ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-[rgba(10,12,15,0.72)] backdrop-blur">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : null}
      <div className="space-y-4">
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
    <article className="group relative overflow-hidden rounded-3xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted text-sm font-semibold text-muted-foreground">
            #{position}
          </span>
          <div className="flex flex-col">
            <Link
              href={`/firmy/${item.companySlug}`}
              prefetch={false}
              className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {item.companyName}
            </Link>
            <span className="text-xs text-muted-foreground">
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

      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${Math.max(progress * 100, progress > 0 ? 8 : 0)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {item.newReviews30d.toLocaleString("pl-PL")} nowych opinii w 30 dni
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Warunki</dt>
          <dd>
            <ScoreBadge value={item.categories.tradingConditions} label="Warunki" />
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Obsluga</dt>
          <dd>
            <ScoreBadge value={item.categories.customerSupport} label="Obsluga" />
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Doswiadczenie</dt>
          <dd>
            <ScoreBadge value={item.categories.userExperience} label="Doswiadczenie" />
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Wyplaty</dt>
          <dd>
            <ScoreBadge value={item.categories.payoutExperience} label="Wyplaty" />
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground/80">Trend</span>
          <TrendPill trend={trend} />
        </div>
        <span>Nowe opinie: {item.newReviews30d.toLocaleString("pl-PL")}</span>
      </div>

      <Button
        asChild
        variant="premium-outline"
        className="mt-5 w-full justify-center rounded-full"
      >
        <Link href={`/firmy/${item.companySlug}#opinie`} prefetch={false}>
          Zobacz opinie
          <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="ml-1" hoverGlow />
        </Link>
      </Button>
    </article>
  );
}
