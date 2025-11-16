"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Loader2, Star, CheckCircle2, Trophy, Medal } from "lucide-react";

import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Button } from "@/components/ui/button";
import { DiscountCoupon } from "@/components/custom/discount-coupon";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { ReviewsRankingItem } from "@/lib/queries/reviews";
import { cn } from "@/lib/utils";

interface ReviewsRankingTableProps {
  items: ReviewsRankingItem[];
  maxReviews: number;
  loading?: boolean;
}

export function ReviewsRankingTable({
  items,
  maxReviews,
  loading = false,
}: ReviewsRankingTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-10 text-center text-sm text-muted-foreground shadow-xs">
        Brak firm spelniajacych wybrane kryteria. Sprobuj poluzowac filtry lub
        wyszukaj inna nazwe.
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="mb-[clamp(0.75rem,1.1vw,1rem)] flex items-center justify-center gap-[clamp(0.45rem,0.7vw,0.65rem)] rounded-2xl border border-primary/30 bg-primary/10 px-[clamp(1rem,1.6vw,1.35rem)] py-[clamp(0.65rem,1vw,0.9rem)] fluid-caption text-primary">
          <Loader2 className="h-[clamp(1rem,0.4vw+0.9rem,1.15rem)] w-[clamp(1rem,0.4vw+0.9rem,1.15rem)] animate-spin" />
          <span>Odświeżanie danych...</span>
        </div>
      )}

      <div className={`overflow-hidden rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs ${loading ? "opacity-60" : ""}`}>
        <div className="max-h-[70vh] overflow-x-auto">
          <Table className="min-w-full table-fixed">
            <TableHeader className="bg-card/82">
              <TableRow className="border-b border-border/40">
                <HeaderCell className="w-16">#</HeaderCell>
                <HeaderCell className="w-64">Firma</HeaderCell>
                <HeaderCell className="w-48">Liczba opinii</HeaderCell>
                <HeaderCell>Warunki</HeaderCell>
                <HeaderCell>Obsluga</HeaderCell>
                <HeaderCell>Doswiadczenie</HeaderCell>
                <HeaderCell>Wyplaty</HeaderCell>
                <HeaderCell className="w-40">Srednia</HeaderCell>
                <HeaderCell className="w-32">Trend 30d</HeaderCell>
                <HeaderCell className="w-40">Kod zniżkowy</HeaderCell>
                <HeaderCell className="w-40">Akcje</HeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {items.map((item, index) => (
                <RankingRow
                  key={item.companyId}
                  item={item}
                  index={index}
                  maxReviews={maxReviews}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

const RankingRow = memo(function RankingRow({
  item,
  index,
  maxReviews,
}: {
  item: ReviewsRankingItem;
  index: number;
  maxReviews: number;
}) {
  const progress =
    maxReviews > 0 ? Math.max(0, Math.min(1, item.totalReviews / maxReviews)) : 0;
  const progressWidth = `${Math.max(progress * 100, progress > 0 ? 6 : 0)}%`;
  const trend = formatTrend(item.trendRatio);
  const overall = item.averageRating ?? 0;

  const isTop3 = index < 3;
  const top3Class = isTop3
    ? index === 0
      ? "bg-amber-500/5 border-l-4 border-l-amber-500"
      : index === 1
        ? "bg-slate-400/5 border-l-4 border-l-slate-400"
        : "bg-amber-700/5 border-l-4 border-l-amber-700"
    : "";

  return (
    <TableRow
      className={cn(
        "border-b border-border/40 transition-all hover:bg-card/68",
        top3Class,
      )}
    >
      <Cell>
        <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
          {isTop3 && (
            index === 0 ? (
              <Trophy className="h-[clamp(1rem,0.4vw+0.9rem,1.15rem)] w-[clamp(1rem,0.4vw+0.9rem,1.15rem)] text-amber-500" />
            ) : (
              <Medal className="h-[clamp(1rem,0.4vw+0.9rem,1.15rem)] w-[clamp(1rem,0.4vw+0.9rem,1.15rem)] text-slate-400" />
            )
          )}
          <span className="text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-semibold text-muted-foreground">
            #{index + 1}
          </span>
        </div>
      </Cell>
      <Cell>
        <div className="flex items-center gap-[clamp(0.75rem,1vw,0.95rem)]">
          <FirmAvatar name={item.companyName} logoUrl={item.logoUrl} priority={isTop3} />
          <div className="flex flex-col gap-[clamp(0.25rem,0.4vw,0.35rem)]">
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
            {item.cashbackRate && item.cashbackRate > 0 ? (
              <span className="fluid-caption font-semibold text-primary">
                {item.maxPlanPrice
                  ? `Cashback ${Math.round(item.cashbackRate)}% | $${((item.maxPlanPrice * item.cashbackRate) / 100).toFixed(2)}`
                  : `Cashback ${Math.round(item.cashbackRate)}%`}
              </span>
            ) : null}
          </div>
        </div>
      </Cell>
      <Cell>
        <div className="flex flex-col gap-[clamp(0.35rem,0.55vw,0.5rem)]">
          <span className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold text-foreground">
            {item.totalReviews.toLocaleString("pl-PL")}
          </span>
          <div className="h-[clamp(0.35rem,0.5vw,0.45rem)] w-full rounded-full bg-muted/70">
            <div
              className="h-full rounded-full bg-primary/80 transition-all w-[var(--progress-width)]"
              style={{ "--progress-width": progressWidth } as React.CSSProperties}
            />
          </div>
        </div>
      </Cell>
      <Cell>
        <ScoreBadge value={item.categories.tradingConditions} label="Warunki" />
      </Cell>
      <Cell>
        <ScoreBadge value={item.categories.customerSupport} label="Obsluga" />
      </Cell>
      <Cell>
        <ScoreBadge value={item.categories.userExperience} label="Doswiadczenie" />
      </Cell>
      <Cell>
        <ScoreBadge value={item.categories.payoutExperience} label="Wyplaty" />
      </Cell>
      <Cell>
        <div className="flex items-center gap-2">
          <PremiumBadge
            variant="glow"
            className={cn(
              "px-[clamp(0.75rem,1.1vw,1rem)] py-[clamp(0.4rem,0.6vw,0.55rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-semibold",
              getScoreBadgeClasses(overall),
            )}
          >
            <PremiumIcon icon={Star} variant="glow" size="sm" className="mr-1" />
            {overall.toFixed(1)}
          </PremiumBadge>
        </div>
        <p className="mt-[clamp(0.2rem,0.35vw,0.3rem)] fluid-caption text-muted-foreground">
          {item.newReviews30d.toLocaleString("pl-PL")} nowych opinii w 30 dni
        </p>
      </Cell>
      <Cell>
        <div className="flex items-center gap-[clamp(0.35rem,0.55vw,0.5rem)] text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold text-foreground">
          <TrendPill trend={trend} />
        </div>
      </Cell>
      <Cell>
        <DiscountCoupon code={item.discountCode} slug={item.companySlug} />
      </Cell>
      <Cell>
        <Button
          asChild
          variant="premium-outline"
          className="w-full justify-center rounded-full"
        >
          <Link href={`/firmy/${item.companySlug}#opinie`} prefetch={false}>
            Zobacz opinie
            <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="ml-1" hoverGlow />
          </Link>
        </Button>
      </Cell>
    </TableRow>
  );
});

RankingRow.displayName = "RankingRow";

function HeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TableHead className={cn("px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground", className)}>
      {children}
    </TableHead>
  );
}

function Cell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TableCell className={cn("px-[clamp(1.25rem,1.8vw,1.6rem)] py-[clamp(1rem,1.5vw,1.3rem)] align-top text-[clamp(0.9rem,0.4vw+0.8rem,1rem)]", className)}>
      <div className="min-w-[clamp(7.5rem,12vw,9.5rem)]">{children}</div>
    </TableCell>
  );
}

function FirmAvatar({
  name,
  logoUrl,
  priority = false,
}: {
  name: string;
  logoUrl: string | null;
  priority?: boolean;
}) {
  if (logoUrl) {
    return (
      <div className="relative">
        <Image
          src={logoUrl}
          alt={name}
          width={44}
          height={44}
          sizes="44px"
          priority={priority}
          className="h-11 w-11 rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! object-contain shadow-xs"
        />
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-emerald-500">
          <CheckCircle2 className="h-3 w-3 text-white" />
        </div>
      </div>
    );
  }

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! text-sm font-semibold text-muted-foreground shadow-xs">
        {initials}
      </div>
      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-emerald-500">
        <CheckCircle2 className="h-3 w-3 text-white" />
      </div>
    </div>
  );
}

export function getScoreBadgeClasses(score: number | null) {
  if (score === null) {
    return "bg-muted text-muted-foreground";
  }

  if (score >= 4.4) {
    return "bg-emerald-500/15 text-emerald-300";
  }

  if (score >= 3.6) {
    return "bg-amber-400/15 text-amber-300";
  }

  return "bg-rose-500/15 text-rose-300";
}

export function ScoreBadge({ value, label }: { value: number | null; label: string }) {
  if (value === null) {
    return (
      <span className="text-xs text-muted-foreground/70" aria-label={`${label}: brak danych`}>
        -
      </span>
    );
  }

  return (
    <PremiumBadge
      variant="outline"
      className={cn(
        "px-[clamp(0.65rem,0.95vw,0.9rem)] py-[clamp(0.35rem,0.5vw,0.45rem)] text-[clamp(0.88rem,0.35vw+0.78rem,0.98rem)] font-semibold",
        getScoreBadgeClasses(value),
      )}
      aria-label={`${label}: ${value.toFixed(1)} / 5`}
    >
      {value.toFixed(1)}
    </PremiumBadge>
  );
}

export function formatTrend(value: number) {
  if (!Number.isFinite(value)) {
    return { formatted: "-", direction: "flat" as const };
  }

  const percentage = value * 100;

  if (Math.abs(percentage) < 0.5) {
    return { formatted: "-", direction: "flat" as const };
  }

  const formatted = `${percentage > 0 ? "+" : ""}${percentage.toFixed(0)}%`;
  return { formatted, direction: percentage > 0 ? "up" : "down" } as const;
}

export function TrendPill({
  trend,
}: {
  trend: ReturnType<typeof formatTrend>;
}) {
  if (trend.direction === "flat") {
    return <span className="text-xs text-muted-foreground">Stabilnie</span>;
  }

  const isPositive = trend.direction === "up";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[clamp(0.35rem,0.55vw,0.5rem)] rounded-full border px-[clamp(0.65rem,0.95vw,0.9rem)] py-[clamp(0.35rem,0.5vw,0.45rem)] text-[clamp(0.82rem,0.33vw+0.72rem,0.92rem)] font-semibold",
        isPositive
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-rose-500/30 bg-rose-500/10 text-rose-300",
      )}
    >
      {trend.formatted}
    </span>
  );
}
