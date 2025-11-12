"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Loader2, Star, CheckCircle2, Trophy, Medal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
      <div className="rounded-3xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-10 text-center text-sm text-muted-foreground shadow-xs">
        Brak firm spelniajacych wybrane kryteria. Sprobuj poluzowac filtry lub
        wyszukaj inna nazwe.
      </div>
    );
  }

  return (
    <div className="relative">
      {loading ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-[rgba(10,12,15,0.72)] backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
        <div className="max-h-[70vh] overflow-x-auto">
          <Table className="min-w-full table-fixed">
            <TableHeader className="bg-[rgba(8,10,13,0.82)]!">
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

function RankingRow({
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
    <TableRow className={`transition-all hover:bg-[rgba(12,14,18,0.6)] border-b border-border/40 ${top3Class}`}>
      <Cell>
        <div className="flex items-center gap-2">
          {isTop3 && (
            index === 0 ? (
              <Trophy className="h-4 w-4 text-amber-500" />
            ) : (
              <Medal className="h-4 w-4 text-slate-400" />
            )
          )}
          <span className="font-semibold text-muted-foreground">#{index + 1}</span>
        </div>
      </Cell>
      <Cell>
        <div className="flex items-center gap-3">
          <FirmAvatar name={item.companyName} logoUrl={item.logoUrl} priority={isTop3} />
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
            {item.cashbackRate && item.cashbackRate > 0 ? (
              <span className="text-xs font-medium text-primary">
                {item.maxPlanPrice
                  ? `Cashback ${Math.round(item.cashbackRate)}% | $${((item.maxPlanPrice * item.cashbackRate) / 100).toFixed(2)}`
                  : `Cashback ${Math.round(item.cashbackRate)}%`}
              </span>
            ) : null}
          </div>
        </div>
      </Cell>
      <Cell>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">
            {item.totalReviews.toLocaleString("pl-PL")}
          </span>
          <div className="h-2.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: progressWidth }}
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
              "px-3 py-1 text-sm font-semibold",
              getScoreBadgeClasses(overall),
            )}
          >
            <PremiumIcon icon={Star} variant="glow" size="sm" className="mr-1" />
            {overall.toFixed(1)}
          </PremiumBadge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {item.newReviews30d.toLocaleString("pl-PL")} nowych opinii w 30 dni
        </p>
      </Cell>
      <Cell>
        <div className="flex items-center gap-1 text-sm font-semibold">
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
          className="w-full justify-center rounded-full px-4"
        >
          <Link href={`/firmy/${item.companySlug}#opinie`} prefetch={false}>
            Zobacz opinie
            <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="ml-1" hoverGlow />
          </Link>
        </Button>
      </Cell>
    </TableRow>
  );
}

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
    <TableCell className={cn("px-6 py-5 align-top text-sm", className)}>
      <div className="min-w-[120px]">{children}</div>
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
          priority={priority}
          className="h-11 w-11 rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! object-contain shadow-xs"
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
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! text-sm font-semibold text-muted-foreground shadow-xs">
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
        "px-2.5 py-1 text-sm font-semibold",
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
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        isPositive
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-rose-500/30 bg-rose-500/10 text-rose-300",
      )}
    >
      {trend.formatted}
    </span>
  );
}
