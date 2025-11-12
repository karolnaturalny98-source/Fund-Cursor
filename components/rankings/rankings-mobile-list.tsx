"use client";

import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import type {
  RankingCompanySnapshot,
  RankingMaxValues,
  RankingTabId,
} from "@/lib/types/rankings";
import { cn } from "@/lib/utils";

interface RankingRenderContext {
  maxValues: RankingMaxValues;
  growthLeaderIds: string[];
}

interface MobileMetric {
  label: string;
  value: React.ReactNode;
}

interface RankingTabConfig {
  id: RankingTabId;
  mobileMetrics: (
    company: RankingCompanySnapshot,
    context: RankingRenderContext,
  ) => MobileMetric[];
}

interface RankingMobileListProps {
  items: RankingCompanySnapshot[];
  config: RankingTabConfig;
  context: RankingRenderContext;
  loading: boolean;
}

// Helper functions (imported from rankings-explorer or duplicated)
function getCompanyHref(company: RankingCompanySnapshot) {
  return company.slug ? `/firmy/${company.slug}` : "/firmy";
}

function getEngagementSummary(company: RankingCompanySnapshot) {
  const parts: string[] = [];
  if (company.reviewCount > 0) {
    parts.push(`${company.reviewCount.toLocaleString("pl-PL")} opinii`);
  }
  if (company.favoritesCount > 0) {
    parts.push(`${company.favoritesCount.toLocaleString("pl-PL")} obserwujących`);
  }
  return parts.join(" | ") || "Brak danych";
}

function ScoreBadge({ score }: { score: number }) {
  function getScoreTone(score: number) {
    if (score >= 80) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    if (score >= 60) return "border-amber-400/30 bg-amber-400/10 text-amber-300";
    return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  }

  return (
    <PremiumBadge
      variant="glow"
      title={score.toFixed(1) + " / 100"}
      className={cn(
        "px-3 py-1 text-sm font-semibold",
        getScoreTone(score),
      )}
    >
      {score.toFixed(1)}
    </PremiumBadge>
  );
}

export function RankingMobileList({
  items,
  config,
  context,
  loading,
}: RankingMobileListProps) {
  return (
    <div className="relative space-y-4">
      {loading && items.length > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Odświeżanie danych...</span>
        </div>
      )}
      {loading && items.length === 0 ? (
        Array.from({ length: 3 }).map((_, index) => (
          <article
            key={`mobile-skeleton-${index}`}
            className="space-y-4 rounded-3xl border border-border/60 bg-card/82 p-5 shadow-xs backdrop-blur-[36px]! supports-backdrop-filter:bg-card/72 animate-pulse"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted text-sm font-semibold text-muted-foreground">
                  <span className="h-3 w-4 rounded bg-muted/40" />
                </span>
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-muted/40" />
                  <div className="h-3 w-40 rounded bg-muted/30" />
                </div>
              </div>
              <div className="h-6 w-16 rounded-full bg-muted/30" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-muted/30" />
              <div className="h-3 w-5/6 rounded bg-muted/20" />
              <div className="h-3 w-2/3 rounded bg-muted/20" />
            </div>
            <div className="h-9 w-full rounded-full bg-muted/30" />
          </article>
        ))
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-border/60 bg-card/66 p-6 text-center text-sm text-muted-foreground">
          Brak firm spelniajacych wybrane kryteria.
        </div>
      ) : (
        <div className={loading ? "opacity-60" : ""}>
          {items.map((company, index) => {
            const metrics = config.mobileMetrics(company, context);
            const summary = getEngagementSummary(company);
            const profileHref = getCompanyHref(company);
            const isGrowthLeader =
              config.id === "growth" && context.growthLeaderIds.includes(company.id);
            return (
              <article
                key={company.id}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted text-sm font-semibold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <Link
                        href={profileHref}
                        prefetch={false}
                        className="text-sm font-semibold text-foreground transition hover:text-primary"
                      >
                        {company.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{summary}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <ScoreBadge score={company.scores[config.id]} />
                    {isGrowthLeader ? (
                      <PremiumBadge
                        variant="glow"
                        title="Firma w Top 5 wzrostu"
                        className="border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300"
                      >
                        Top rosnacy
                      </PremiumBadge>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="flex items-center justify-between text-xs text-muted-foreground"
                    >
                      <span className="font-medium text-foreground">
                        {metric.label}
                      </span>
                      <span className="text-sm text-foreground">{metric.value}</span>
                    </div>
                  ))}
                </div>

                <Button
                  asChild
                  variant="premium-outline"
                  className="mt-5 w-full justify-center rounded-full"
                >
                  <Link href={profileHref} prefetch={false}>
                    Zobacz szczegoly
                    <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="ml-1" hoverGlow />
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

