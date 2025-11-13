
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Globe, Layers, Box, Loader2, RefreshCw, Search, X, Filter, Award, Receipt, Users, Sparkles, TrendingUp, BarChart3, CheckCircle2, Trophy, Medal } from "lucide-react";
import { useEffect, useMemo, useRef, useState, memo } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/analysis/loading-skeleton";

const RankingsCharts = dynamic(
  () => import("./rankings-charts").then((mod) => ({ default: mod.RankingsCharts })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const RankingMobileList = dynamic(
  () => import("./rankings-mobile-list").then((mod) => ({ default: mod.RankingMobileList })),
  { ssr: false, loading: () => <div className="space-y-4"><div className="h-32 animate-pulse rounded-3xl bg-muted" /><div className="h-32 animate-pulse rounded-3xl bg-muted" /></div> }
);

import { RankingsExportButton } from "./rankings-export-button";

import type {
  RankingCompanySnapshot,
  RankingMaxValues,
  RankingTabId,
  RankingsDataset,
  RankingsExplorerInitialFilters,
} from "@/lib/types/rankings";
import { cn } from "@/lib/utils";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Button } from "@/components/ui/button";
import { DiscountCoupon } from "@/components/custom/discount-coupon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface RankingsExplorerProps {
  initialData: RankingsDataset;
  initialFilters: RankingsExplorerInitialFilters;
  initialTab: RankingTabId;
}

interface ExplorerFilters {
  search: string;
  country: string | null;
  evaluationModel: string | null;
  accountType: string | null;
  minReviews: number;
  hasCashback: boolean;
}

interface RankingRenderContext {
  maxValues: RankingMaxValues;
  growthLeaderIds: string[];
}

interface RankingColumnConfig {
  id: string;
  label: string;
  className?: string;
  render: (
    company: RankingCompanySnapshot,
    context: RankingRenderContext,
  ) => ReactNode;
}

interface MobileMetric {
  label: string;
  value: ReactNode;
}

interface RankingTabConfig {
  id: RankingTabId;
  label: string;
  description: string;
  iconName: "Award" | "BarChart3" | "Receipt" | "Users" | "Sparkles" | "TrendingUp";
  sortAccessor: (company: RankingCompanySnapshot) => number;
  columns: RankingColumnConfig[];
  mobileMetrics: (
    company: RankingCompanySnapshot,
    context: RankingRenderContext,
  ) => MobileMetric[];
}
const RANKING_TABS: RankingTabConfig[] = [
  {
    id: "overall",
    label: "Ogolny",
    description:
      "Laczy oceny, liczbe opinii, rekomendacje oraz aktywnosc spolecznosci.",
    iconName: "Award",
    sortAccessor: (company) => company.scores.overall,
    columns: [
      {
        id: "rating",
        label: "Ocena",
        render: (company) => <RatingBadge rating={company.averageRating} />,
      },
      {
        id: "reviews",
        label: "Opinie",
        render: (company, context) => (
          <MetricBar
            value={company.reviewCount}
            max={context.maxValues.reviewCount}
            suffix="opinii"
          />
        ),
      },
      {
        id: "favorites",
        label: "Obserwujacy",
        render: (company, context) => (
          <MetricBar
            value={company.favoritesCount}
            max={context.maxValues.favoritesCount}
            suffix="obserwujacych"
          />
        ),
      },
      {
        id: "trend",
        label: "Trend 30d",
        className: "w-[160px]",
        render: (company) => <TrendPill ratio={company.trendRatio} />,
      },
    ],
    mobileMetrics: (company, context) => [
      { label: "Ocena", value: <RatingBadge rating={company.averageRating} /> },
      {
        label: "Opinie",
        value: (
          <MetricInline
            value={company.reviewCount}
            suffix="opinii"
            max={context.maxValues.reviewCount}
          />
        ),
      },
      { label: "Trend", value: <TrendPill ratio={company.trendRatio} /> },
    ],
  },
  {
    id: "conditions",
    label: "Warunki",
    description:
      "Ocena warunkow handlowych i doswiadczenia platformowego na bazie opinii.",
    iconName: "BarChart3",
    sortAccessor: (company) => company.scores.conditions,
    columns: [
      {
        id: "trading",
        label: "Warunki",
        render: (company) => (
          <CategoryBadge
            label="Warunki"
            value={company.categoryScores.tradingConditions}
          />
        ),
      },
      {
        id: "experience",
        label: "Platforma",
        render: (company) => (
          <CategoryBadge
            label="Platforma"
            value={company.categoryScores.userExperience}
          />
        ),
      },
      {
        id: "support",
        label: "Obsluga",
        render: (company) => (
          <CategoryBadge
            label="Obsluga"
            value={company.categoryScores.customerSupport}
          />
        ),
      },
      {
        id: "rating",
        label: "Ocena",
        render: (company) => <RatingBadge rating={company.averageRating} />,
      },
    ],
    mobileMetrics: (company) => [
      {
        label: "Warunki",
        value: (
          <CategoryBadge
            label="Warunki"
            value={company.categoryScores.tradingConditions}
          />
        ),
      },
      {
        label: "Platforma",
        value: (
          <CategoryBadge
            label="Platforma"
            value={company.categoryScores.userExperience}
          />
        ),
      },
      { label: "Ocena", value: <RatingBadge rating={company.averageRating} /> },
    ],
  },
  {
    id: "payouts",
    label: "Wyplaty",
    description:
      "Analiza satysfakcji wyplat, skutecznosci cashback i czasu realizacji.",
    iconName: "Receipt",
    sortAccessor: (company) => company.scores.payouts,
    columns: [
      {
        id: "payout-exp",
        label: "Satysfakcja",
        render: (company) => (
          <CategoryBadge
            label="Wyplaty"
            value={company.categoryScores.payoutExperience}
          />
        ),
      },
      {
        id: "redeem-rate",
        label: "Skutecznosc cashback",
        render: (company) => (
          <MetricInline
            value={company.cashbackRedeemRate}
            formatValue={(value) =>
              value !== null ? Math.round(value * 100).toString() + "%" : "Brak danych"
            }
          />
        ),
      },
      {
        id: "payout-time",
        label: "Sredni czas (h)",
        render: (company) => (
          <MetricInline
            value={company.cashbackPayoutHours}
            formatValue={(value) =>
              value !== null ? "~" + Math.round(value) + " h" : "Brak danych"
            }
          />
        ),
      },
      {
        id: "new-reviews",
        label: "Nowe opinie",
        render: (company, context) => (
          <MetricBar
            value={company.newReviews30d}
            max={context.maxValues.newReviews30d}
            suffix="30d"
          />
        ),
      },
    ],
    mobileMetrics: (company) => [
      {
        label: "Cashback",
        value:         company.hasCashback ? (
          <PremiumBadge variant="glow" className="border-primary/30 bg-primary/10 text-primary">
            Dostepny
          </PremiumBadge>
        ) : (
          <span className="text-xs text-muted-foreground">Brak danych</span>
        ),
      },
      {
        label: "Skutecznosc",
        value:
          company.cashbackRedeemRate !== null
            ? Math.round(company.cashbackRedeemRate * 100).toString() + "%"
            : "Brak danych",
      },
      {
        label: "Czas wyplaty",
        value:
          company.cashbackPayoutHours !== null
            ? "~" + Math.round(company.cashbackPayoutHours) + " h"
            : "Brak danych",
      },
    ],
  },
  {
    id: "community",
    label: "Spolecznosc",
    description:
      "Skupia sie na aktywnosci uzytkownikow, rekomendacjach i zaangazowaniu.",
    iconName: "Users",
    sortAccessor: (company) => company.scores.community,
    columns: [
      {
        id: "rating",
        label: "Ocena",
        render: (company) => <RatingBadge rating={company.averageRating} />,
      },
      {
        id: "recommended",
        label: "Rekomenduje",
        render: (company) => (
          <MetricInline
            value={(company.recommendedRatio ?? 0) * 100}
            formatValue={(value) =>
              value !== null && company.recommendedRatio !== null
                ? value.toFixed(0) + "%"
                : "—"
            }
          />
        ),
      },
      {
        id: "new-reviews",
        label: "Nowe opinie",
        render: (company, context) => (
          <MetricBar
            value={company.newReviews30d}
            max={context.maxValues.newReviews30d}
            suffix="30d"
          />
        ),
      },
      {
        id: "favorites",
        label: "Obserwujacy",
        render: (company, context) => (
          <MetricBar
            value={company.favoritesCount}
            max={context.maxValues.favoritesCount}
            suffix="obserwujacych"
          />
        ),
      },
    ],
    mobileMetrics: (company) => [
      { label: "Ocena", value: <RatingBadge rating={company.averageRating} /> },
      {
        label: "Rekomendacje",
        value:
          company.recommendedRatio !== null
            ? Math.round(company.recommendedRatio * 100).toString() + "%"
            : "—",
      },
      {
        label: "Nowe opinie",
        value: company.newReviews30d.toLocaleString("pl-PL") + " / 30d",
      },
    ],
  },
  {
    id: "cashback",
    label: "Cashback",
    description:
      "Ocena atrakcyjnosci i skutecznosci programow cashbackowych firm.",
    iconName: "Sparkles",
    sortAccessor: (company) => company.scores.cashback,
    columns: [
      {
        id: "availability",
        label: "Dostepnosc",
        render: (company) =>
          company.hasCashback ? (
            <PremiumBadge variant="glow" className="border-primary/30 bg-primary/10 text-primary">
              Dostepny
            </PremiumBadge>
          ) : (
            <span className="text-xs text-muted-foreground">Brak</span>
          ),
      },
      {
        id: "avg-points",
        label: "Srednie punkty",
        render: (company, context) => (
          <MetricBar
            value={company.cashbackAveragePoints}
            max={context.maxValues.cashbackAveragePoints}
            suffix="pkt"
            formatValue={(value) =>
              value !== null
                ? value.toFixed(0) + " pkt"
                : "Brak danych"
            }
          />
        ),
      },
      {
        id: "redeem",
        label: "Skutecznosc",
        render: (company) => (
          <MetricInline
            value={company.cashbackRedeemRate}
            formatValue={(value) =>
              value !== null ? Math.round(value * 100).toString() + "%" : "Brak danych"
            }
          />
        ),
      },
      {
        id: "payout-time",
        label: "Czas wyplat",
        render: (company) => (
          <MetricInline
            value={company.cashbackPayoutHours}
            formatValue={(value) =>
              value !== null ? "~" + Math.round(value) + " h" : "Brak danych"
            }
          />
        ),
      },
    ],
    mobileMetrics: (company) => [
      {
        label: "Punkty",
        value:
          company.cashbackAveragePoints !== null
            ? company.cashbackAveragePoints.toFixed(0) + " pkt"
            : "Brak danych",
      },
      {
        label: "Skutecznosc",
        value:
          company.cashbackRedeemRate !== null
            ? Math.round(company.cashbackRedeemRate * 100).toString() + "%"
            : "Brak danych",
      },
      {
        label: "Czas",
        value:
          company.cashbackPayoutHours !== null
            ? "~" + Math.round(company.cashbackPayoutHours) + " h"
            : "Brak danych",
      },
    ],
  },
  {
    id: "growth",
    label: "Momentum",
    description:
      "Dynamika wzrostu oparta o trend klikniec, nowe opinie i zaangazowanie.",
    iconName: "TrendingUp",
    sortAccessor: (company) => company.scores.growth,
    columns: [
      {
        id: "trend",
        label: "Trend 30d",
        className: "w-[160px]",
        render: (company) => <TrendPill ratio={company.trendRatio} />,
      },
      {
        id: "clicks",
        label: "Klikniecia",
        render: (company, context) => (
          <MetricBar
            value={company.clicks30d}
            max={context.maxValues.clicks30d}
            suffix="30d"
          />
        ),
      },
      {
        id: "new-reviews",
        label: "Nowe opinie",
        render: (company, context) => (
          <MetricBar
            value={company.newReviews30d}
            max={context.maxValues.newReviews30d}
            suffix="30d"
          />
        ),
      },
      {
        id: "favorites",
        label: "Obserwujacy",
        render: (company, context) => (
          <MetricBar
            value={company.favoritesCount}
            max={context.maxValues.favoritesCount}
            suffix="obserwujacych"
          />
        ),
      },
    ],
    mobileMetrics: (company, context) => [
      { label: "Trend", value: <TrendPill ratio={company.trendRatio} /> },
      {
        label: "Klikniecia",
        value: (
          <MetricInline
            value={company.clicks30d}
            suffix="30d"
            max={context.maxValues.clicks30d}
          />
        ),
      },
      {
        label: "Nowe opinie",
        value: (
          <MetricInline
            value={company.newReviews30d}
            suffix="30d"
            max={context.maxValues.newReviews30d}
          />
        ),
      },
    ],
  },
];

const DEFAULT_FILTERS: ExplorerFilters = {
  search: "",
  country: null,
  evaluationModel: null,
  accountType: null,
  minReviews: 0,
  hasCashback: false,
};
export function RankingsExplorer({
  initialData,
  initialFilters,
  initialTab,
}: RankingsExplorerProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<ExplorerFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [searchDraft, setSearchDraft] = useState(initialFilters.search ?? "");
  const [activeTab, setActiveTab] = useState<RankingTabId>(initialTab);
  const [data, setData] = useState<RankingsDataset>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const hasMounted = useRef(false);
  const firstFetch = useRef(true);

  // Detect desktop viewport for conditional rendering
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const hasActiveFilters =
    (filters.search?.length ?? 0) > 0 ||
    filters.country !== null ||
    filters.evaluationModel !== null ||
    filters.accountType !== null ||
    filters.minReviews > 0 ||
    filters.hasCashback;

  useEffect(() => {
    const handler = window.setTimeout(() => {
      const trimmed = searchDraft.trim();
      setFilters((prev) =>
        prev.search === trimmed
          ? prev
          : {
              ...prev,
              search: trimmed,
            },
      );
    }, 250);

    return () => {
      window.clearTimeout(handler);
    };
  }, [searchDraft]);

  useEffect(() => {
    if (firstFetch.current) {
      firstFetch.current = false;
      return;
    }

    const controller = new AbortController();
    const params = buildQueryParams(filters);
    const queryString = params ? "?" + params : "";
    setLoading(true);
    setError(null);

    fetch("/api/rankings" + queryString, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Nie udalo sie pobrac danych rankingowych");
        }
        return response.json();
      })
      .then((payload: RankingsDataset) => {
        setData(payload);
      })
      .catch((fetchError) => {
        if (fetchError.name === "AbortError") {
          return;
        }
        console.error("[rankings] fetch error", fetchError);
        setError("Nie udalo sie odswiezyc danych. Sprobuj ponownie.");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [filters]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const params = buildUrlParams(filters, activeTab);
    router.replace(params ? "?" + params : "?", { scroll: false });
  }, [filters, activeTab, router]);

  const growthLeaderIds = useMemo(() => {
    return [...data.companies]
      .sort((a, b) => b.scores.growth - a.scores.growth)
      .slice(0, 5)
      .map((company) => company.id);
  }, [data.companies]);

  const context = useMemo<RankingRenderContext>(
    () => ({
      maxValues: data.maxValues,
      growthLeaderIds,
    }),
    [data.maxValues, growthLeaderIds],
  );

  const activeConfig =
    RANKING_TABS.find((tab) => tab.id === activeTab) ?? RANKING_TABS[0];

  const sortedCompanies = useMemo(() => {
    const copy = [...data.companies];
    copy.sort((a, b) => activeConfig.sortAccessor(b) - activeConfig.sortAccessor(a));
    return copy;
  }, [data.companies, activeConfig]);

  const handleFilterChange = (partial: Partial<ExplorerFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const clearFilter = (key: keyof ExplorerFilters) => {
    setFilters((prev) => {
      const next = { ...prev };
      switch (key) {
        case "search":
          next.search = "";
          break;
        case "country":
          next.country = null;
          break;
        case "evaluationModel":
          next.evaluationModel = null;
          break;
        case "accountType":
          next.accountType = null;
          break;
        case "minReviews":
          next.minReviews = 0;
          break;
        case "hasCashback":
          next.hasCashback = false;
          break;
        default:
          break;
      }
      return next;
    });
    if (key === "search") {
      setSearchDraft("");
    }
  };

  const resetFilters = () => {
    setSearchDraft("");
    setFilters(DEFAULT_FILTERS);
  };

  const applyQuickFilter = (preset: "top10" | "highest-cashback" | "most-popular" | "most-reviews") => {
    resetFilters();
    switch (preset) {
      case "top10":
        // Already sorted by default, no additional filters needed
        break;
      case "highest-cashback":
        handleFilterChange({ hasCashback: true });
        break;
      case "most-popular":
        handleFilterChange({ minReviews: 10 });
        break;
      case "most-reviews":
        handleFilterChange({ minReviews: 50 });
        break;
    }
  };

  return (
    <section className="space-y-8">
      <FilterPanel
        filters={filters}
        searchDraft={searchDraft}
        onSearchDraftChange={setSearchDraft}
        onFiltersChange={handleFilterChange}
        resetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        countries={data.availableCountries}
        evaluationModels={data.availableEvaluationModels}
        accountTypes={data.availableAccountTypes}
        onFilterRemove={clearFilter}
        onQuickFilter={applyQuickFilter}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Rankingi</h2>
          <p className="text-sm text-muted-foreground">
            Eksploruj rozne perspektywy – wybierz zakladke, aby zobaczyc firmowe
            zestawienie wedlug dopasowanego algorytmu.
          </p>
        </div>
        <PremiumBadge variant="outline" className="border-primary/30 bg-secondary/20 text-secondary-foreground">
          Dane odswiezone: {new Date(data.generatedAt).toLocaleString("pl-PL")}
        </PremiumBadge>
      </div>

      <Tabs
        value={activeConfig.id}
        onValueChange={(value) => setActiveTab(value as RankingTabId)}
      >
        <TabsList className="flex flex-wrap justify-start gap-2 rounded-lg border border-border/40 bg-background/60 p-1 shadow-xs">
          {RANKING_TABS.map((tab) => {
            const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
              Award,
              BarChart3,
              Receipt,
              Users,
              Sparkles,
              TrendingUp,
            };
            const Icon = IconMap[tab.iconName] || Award;

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="min-w-[140px] flex-1 gap-2 rounded-lg border border-border/40 bg-background/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {RANKING_TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            <p className="text-sm text-muted-foreground">{tab.description}</p>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {sortedCompanies.length.toLocaleString("pl-PL")} firm w zakladce{" "}
              <span className="font-semibold text-foreground">{tab.label}</span>
            </p>

            {error ? (
              <div className="rounded-3xl border border-destructive/40 bg-destructive/10 px-5 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-4">
            {sortedCompanies.length > 0 && (
              <RankingsExportButton
                companies={sortedCompanies}
                activeTab={tab.id}
              />
            )}
          </div>

            {/* Conditional rendering instead of CSS hide for better performance */}
            {isDesktop ? (
              <RankingDesktopTable
                items={sortedCompanies}
                config={tab}
                context={context}
                loading={loading}
              />
            ) : (
              <RankingMobileList
                items={sortedCompanies}
                config={tab}
                context={context}
                loading={loading}
              />
            )}

            {sortedCompanies.length > 0 && (
              <RankingsCharts
                companies={sortedCompanies}
                activeTab={tab.id}
                maxValues={context.maxValues}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
function FilterPanel({
  filters,
  searchDraft,
  onSearchDraftChange,
  onFiltersChange,
  resetFilters,
  hasActiveFilters,
  countries,
  evaluationModels,
  accountTypes,
  onFilterRemove,
  onQuickFilter,
}: {
  filters: ExplorerFilters;
  searchDraft: string;
  onSearchDraftChange: (value: string) => void;
  onFiltersChange: (value: Partial<ExplorerFilters>) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  countries: string[];
  evaluationModels: string[];
  accountTypes: string[];
  onFilterRemove: (key: keyof ExplorerFilters) => void;
  onQuickFilter: (preset: "top10" | "highest-cashback" | "most-popular" | "most-reviews") => void;
}) {
  const activeChips: { key: keyof ExplorerFilters; label: string }[] = [];
  if (filters.search) {
    activeChips.push({ key: "search", label: `Szukaj: "${filters.search}"` });
  }
  if (filters.country) {
    activeChips.push({ key: "country", label: `Kraj: ${filters.country}` });
  }
  if (filters.evaluationModel) {
    activeChips.push({
      key: "evaluationModel",
      label: `Model: ${filters.evaluationModel}`,
    });
  }
  if (filters.accountType) {
    activeChips.push({
      key: "accountType",
      label: `Typ konta: ${filters.accountType}`,
    });
  }
  if (filters.minReviews > 0) {
    activeChips.push({
      key: "minReviews",
      label: `Min. opinii: ${filters.minReviews}`,
    });
  }
  if (filters.hasCashback) {
    activeChips.push({
      key: "hasCashback",
      label: "Tylko cashback",
    });
  }

  return (
    <Card className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Filter className="h-5 w-5 text-primary" />
          Filtry rankingu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
            Szybkie filtry:
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onQuickFilter("top10")}
            className="h-7 rounded-full px-2.5 text-[11px] font-normal"
          >
            Top 10
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onQuickFilter("highest-cashback")}
            className="h-7 rounded-full px-2.5 text-[11px] font-normal"
          >
            Najwyższy cashback
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onQuickFilter("most-popular")}
            className="h-7 rounded-full px-2.5 text-[11px] font-normal"
          >
            Najpopularniejsze
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onQuickFilter("most-reviews")}
            className="h-7 rounded-full px-2.5 text-[11px] font-normal"
          >
            Najwięcej opinii
          </Button>
        </div>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchDraft}
                onChange={(event) => onSearchDraftChange(event.target.value)}
                placeholder="Szukaj firmy po nazwie lub slugu..."
                className="h-11 rounded-full border border-border/60 bg-card/72 backdrop-blur-[36px]! pl-9 shadow-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                label="Kraj"
                value={filters.country ?? ""}
                onChange={(value) => onFiltersChange({ country: value || null })}
                options={countries}
                icon={Globe}
              />
              <FilterSelect
                label="Model oceny"
                value={filters.evaluationModel ?? ""}
                onChange={(value) =>
                  onFiltersChange({ evaluationModel: value || null })
                }
                options={evaluationModels}
                icon={Layers}
              />
              <FilterSelect
                label="Typ konta"
                value={filters.accountType ?? ""}
                onChange={(value) =>
                  onFiltersChange({ accountType: value || null })
                }
                options={accountTypes}
                icon={Box}
              />
            </div>
          </div>
          {activeChips.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/50 bg-background/60 px-4 py-3 text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wide text-muted-foreground/80">
                Aktywne filtry
              </span>
              {activeChips.map((chip) => (
                <PremiumBadge
                  variant="outline"
                  key={chip.key}
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                  onClick={() => onFilterRemove(chip.key)}
                  aria-label={`Usun filtr ${chip.label}`}
                >
                  {chip.label}
                  <X className="h-3 w-3" />
                </PremiumBadge>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Min. opinii
              <Input
                type="number"
                min={0}
                value={filters.minReviews}
                onChange={(event) =>
                  onFiltersChange({
                    minReviews: Math.max(0, Number(event.target.value) || 0),
                  })
                }
                className="h-11 w-24 rounded-full border-border/60 text-center"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-foreground">
              <input
                type="checkbox"
                checked={filters.hasCashback}
                onChange={(event) =>
                  onFiltersChange({ hasCashback: event.target.checked })
                }
                className="h-4 w-4 rounded border-border/60 text-primary focus:ring-primary"
              />
              Tylko firmy z cashback
            </label>
            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onFiltersChange({})}
                className="rounded-full border border-border/60 px-3 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              >
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Odswiez
              </Button>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="rounded-full border border-destructive/40 px-3 text-sm text-destructive transition hover:border-destructive hover:bg-destructive/10"
                >
                  Wyczysc filtry
                </Button>
              ) : null}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
function FilterSelect({
  label,
  value,
  onChange,
  options,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-2">
      {Icon && (
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <Select value={value || "all"} onValueChange={(val) => onChange(val === "all" ? "" : val)}>
        <SelectTrigger className="h-11 w-[180px] rounded-full border-border/60 bg-background/60 text-sm">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
function RankingDesktopTable({
  items,
  config,
  context,
  loading,
}: {
  items: RankingCompanySnapshot[];
  config: RankingTabConfig;
  context: RankingRenderContext;
  loading: boolean;
}) {
  return (
    <div className="relative">
      {loading && items.length > 0 && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Odświeżanie danych...</span>
        </div>
      )}
      <div className={`overflow-hidden rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs ${loading && items.length > 0 ? "opacity-60" : ""}`}>
        <div className="max-h-[70vh] overflow-x-auto">
          <Table className="min-w-full table-fixed" aria-busy={loading}>
            <TableHeader className="bg-card/82">
              <TableRow className="border-b border-border/40">
                <TableHead className="w-16 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">#</TableHead>
                <TableHead className="w-72 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Firma</TableHead>
                <TableHead className="w-32 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Score</TableHead>
                {config.columns.map((column) => (
                  <TableHead key={column.id} className={cn("px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground", column.className)}>
                    {column.label}
                  </TableHead>
                ))}
                <TableHead className="w-40 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kod zniżkowy</TableHead>
                <TableHead className="w-36 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm text-foreground">
              {loading && items.length === 0 ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`} className="animate-pulse border-b border-border/40">
                    <TableCell className="px-6 py-5 align-top text-sm">
                      <div className="h-4 w-8 rounded bg-muted/60" />
                    </TableCell>
                    <TableCell className="px-6 py-5 align-top text-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-muted/40" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 rounded bg-muted/40" />
                          <div className="h-3 w-24 rounded bg-muted/30" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 align-top text-sm">
                      <div className="h-7 w-16 rounded-full bg-muted/40" />
                      <div className="mt-2 h-3 w-24 rounded bg-muted/30" />
                    </TableCell>
                    {config.columns.map((column) => (
                      <TableCell
                        key={`skeleton-${rowIndex}-${column.id}`}
                        className={cn("px-6 py-5 align-top text-sm", column.className)}
                      >
                        <div className="h-3 w-full rounded bg-muted/30" />
                      </TableCell>
                    ))}
                    <TableCell className="px-6 py-5 align-top text-sm">
                      <div className="h-12 w-full rounded-lg bg-muted/30" />
                    </TableCell>
                    <TableCell className="px-6 py-5 align-top text-sm">
                      <div className="h-9 w-full rounded-full bg-muted/30" />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow className="border-b border-border/40">
                  <TableCell
                    colSpan={config.columns.length + 5}
                    className="px-6 py-6 text-center text-sm text-muted-foreground"
                  >
                    Brak firm spelniajacych wybrane kryteria.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((company, index) => (
                  <RankingRow
                    key={company.id}
                    index={index}
                    company={company}
                    config={config}
                    context={context}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

const RankingRow = memo(function RankingRow({
  company,
  index,
  config,
  context,
}: {
  company: RankingCompanySnapshot;
  index: number;
  config: RankingTabConfig;
  context: RankingRenderContext;
}) {
  const isGrowthLeader =
    config.id === "growth" && context.growthLeaderIds.includes(company.id);

  const isTop3 = index < 3;
  const top3Class = isTop3
    ? index === 0
      ? "bg-amber-500/5 border-l-4 border-l-amber-500"
      : index === 1
        ? "bg-slate-400/5 border-l-4 border-l-slate-400"
        : "bg-amber-700/5 border-l-4 border-l-amber-700"
    : "";

  return (
    <TableRow className={`transition-all hover:bg-background/60 border-b border-border/40 ${top3Class}`}>
      <TableCell className="px-6 py-5 align-top text-sm font-semibold text-muted-foreground">
        <div className="flex items-center gap-2">
          {isTop3 && (
            index === 0 ? (
              <Trophy className="h-4 w-4 text-amber-500" />
            ) : (
              <Medal className="h-4 w-4 text-slate-400" />
            )
          )}
          #{index + 1}
        </div>
      </TableCell>
      <TableCell className="px-6 py-5 align-top text-sm">
        <CompanyCell company={company} priority={isTop3} />
      </TableCell>
      <TableCell className="px-6 py-5 align-top text-sm">
        <ScoreBadge score={company.scores[config.id]} />
        {isGrowthLeader ? (
          <PremiumBadge
            variant="glow"
            title="Firma w Top 5 wzrostu"
            className="mt-2 w-fit border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300"
          >
            Top rosnacy
          </PremiumBadge>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground">
          {company.reviewCount.toLocaleString("pl-PL")} opinii
        </p>
      </TableCell>
      {config.columns.map((column) => (
        <TableCell key={column.id} className={cn("px-6 py-5 align-top text-sm", column.className)}>
          {column.render(company, context)}
        </TableCell>
      ))}
      <TableCell className="px-6 py-5 align-top text-sm">
        <DiscountCoupon code={company.discountCode ?? null} slug={company.slug} />
      </TableCell>
      <TableCell className="px-6 py-5 align-top text-sm">
        <Button
          asChild
          variant="premium-outline"
          className="w-full justify-center rounded-full px-4"
        >
          <Link href={getCompanyHref(company)} prefetch={false}>
            Przejdz
            <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="ml-1" hoverGlow />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
});

RankingRow.displayName = "RankingRow";

function getCompanyHref(company: RankingCompanySnapshot) {
  return company.slug ? `/firmy/${company.slug}` : "/firmy";
}

function getCompanyMeta(company: RankingCompanySnapshot) {
  const metaParts: string[] = [];
  metaParts.push(company.country ?? "-");
  if (company.foundedYear) {
    metaParts.push("od " + company.foundedYear.toString());
  }
  return metaParts.join(" | ");
}

// getEngagementSummary moved to rankings-mobile-list.tsx (no longer used here)

function CompanyCell({ company, priority = false }: { company: RankingCompanySnapshot; priority?: boolean }) {
  const meta = getCompanyMeta(company);
  const profileHref = getCompanyHref(company);
  
  const cashbackDisplay = useMemo(() => {
    if (!company.cashbackRate || company.cashbackRate <= 0) {
      return null;
    }
    
    const cashbackAmount = company.maxPlanPrice
      ? (company.maxPlanPrice * company.cashbackRate) / 100
      : null;
    
    if (cashbackAmount === null) {
      return `Cashback ${Math.round(company.cashbackRate)}%`;
    }
    
    return `Cashback ${Math.round(company.cashbackRate)}% | $${cashbackAmount.toFixed(2)}`;
  }, [company.cashbackRate, company.maxPlanPrice]);
  
  return (
    <div className="flex items-center gap-3">
      <CompanyAvatar name={company.name} logoUrl={company.logoUrl} priority={priority} />
      <div className="flex flex-col">
        <Link
          href={profileHref}
          prefetch={false}
          className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          {company.name}
        </Link>
        <p className="text-xs text-muted-foreground">{meta}</p>
        {cashbackDisplay ? (
          <p className="text-xs font-medium text-primary">{cashbackDisplay}</p>
        ) : null}
      </div>
    </div>
  );
}


function CompanyAvatar({
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

function ScoreBadge({ score }: { score: number }) {
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

function RatingBadge({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }
  return (
    <PremiumBadge
      variant="glow"
      title={rating.toFixed(2) + " / 5"}
      className="border-primary/30 bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary"
    >
      {rating.toFixed(1)}
    </PremiumBadge>
  );
}

function CategoryBadge({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  if (value === null) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }
  return (
    <PremiumBadge
      variant="outline"
      title={label + ": " + value.toFixed(2) + " / 5"}
      className="border-primary/30 bg-secondary/20 px-2.5 py-1 text-sm font-semibold text-secondary-foreground"
    >
      {value.toFixed(1)}
    </PremiumBadge>
  );
}

function MetricBar({
  value,
  max,
  suffix,
  formatValue,
}: {
  value: number | null | undefined;
  max: number;
  suffix?: string;
  formatValue?: (value: number | null) => string;
}) {
  const hasValue = value !== null && value !== undefined && Number.isFinite(value);
  const numericValue = hasValue ? Number(value) : null;
  const ratio =
    hasValue && max > 0 ? Math.min(Math.max((numericValue ?? 0) / max, 0), 1) : 0;
  const formatted = formatValue
    ? formatValue(hasValue ? numericValue : null)
    : hasValue
      ? (numericValue as number).toLocaleString("pl-PL") + (suffix ? " " + suffix : "")
      : "Brak danych";
  const widthPercent = Math.max(ratio * 100, hasValue && (numericValue ?? 0) > 0 ? 6 : 0);
  return (
    <div
      className="flex flex-col gap-2"
      title={
        hasValue && max > 0
          ? formatted + " (" + Math.round(ratio * 100).toString() + "% z max)"
          : formatted
      }
    >
      <span className="text-sm font-semibold text-foreground">{formatted}</span>
      <div className="h-2.5 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] w-[var(--progress-width)]"
          style={{ "--progress-width": widthPercent.toString() + "%" } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

function MetricInline({
  value,
  suffix,
  formatValue,
  max,
}: {
  value: number | null | undefined;
  suffix?: string;
  formatValue?: (value: number | null) => string;
  max?: number;
}) {
  const hasValue = value !== null && value !== undefined && Number.isFinite(value);
  const numericValue = hasValue ? Number(value) : null;
  const formatted = formatValue
    ? formatValue(hasValue ? numericValue : null)
    : hasValue
      ? (numericValue as number).toLocaleString("pl-PL") +
        (suffix ? " " + suffix : "")
      : "Brak danych";
  if (max && max > 0 && hasValue) {
    const ratio = Math.min(Math.max((numericValue ?? 0) / max, 0), 1);
    return (
      <span
        title={formatted + " (" + Math.round(ratio * 100).toString() + "% z max)"}
        className="text-sm font-semibold text-foreground"
      >
        {formatted}
        <span className="ml-1 text-xs text-muted-foreground">
          ({Math.round(ratio * 100)}%)
        </span>
      </span>
    );
  }
  if (!hasValue) {
    return <span className="text-xs text-muted-foreground">{formatted}</span>;
  }
  return (
    <span title={formatted} className="text-sm font-semibold text-foreground">
      {formatted}
    </span>
  );
}

function TrendPill({ ratio }: { ratio: number }) {
  if (!Number.isFinite(ratio) || Math.abs(ratio) < 0.01) {
    return (
      <span
        title="Stabilny trend (+/-1%)"
        className="inline-flex items-center rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground"
      >
        Stabilnie
      </span>
    );
  }

  const percent = ratio * 100;
  const positive = percent > 0;
  const label = (positive ? "+" : "") + percent.toFixed(0) + "%";
  return (
    <span
      title={(positive ? "Wzrost " : "Spadek ") + percent.toFixed(1) + "%"}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        positive
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-rose-500/30 bg-rose-500/10 text-rose-300",
      )}
    >
      {label}
    </span>
  );
}

function getScoreTone(score: number) {
  if (score >= 85) {
    return "bg-emerald-500/15 text-emerald-300";
  }
  if (score >= 70) {
    return "bg-primary/10 text-primary";
  }
  if (score >= 55) {
    return "bg-amber-400/15 text-amber-300";
  }
  return "bg-rose-500/15 text-rose-300";
}

function buildQueryParams(filters: ExplorerFilters) {
  const params = new URLSearchParams();
  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.country) {
    params.set("country", filters.country);
  }
  if (filters.evaluationModel) {
    params.set("model", filters.evaluationModel);
  }
  if (filters.accountType) {
    params.set("account", filters.accountType);
  }
  if (filters.minReviews > 0) {
    params.set("minReviews", filters.minReviews.toString());
  }
  if (filters.hasCashback) {
    params.set("cashback", "true");
  }
  return params.toString();
}

function buildUrlParams(filters: ExplorerFilters, tab: RankingTabId) {
  const params = new URLSearchParams();
  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.country) {
    params.set("country", filters.country);
  }
  if (filters.evaluationModel) {
    params.set("model", filters.evaluationModel);
  }
  if (filters.accountType) {
    params.set("account", filters.accountType);
  }
  if (filters.minReviews > 0) {
    params.set("minReviews", filters.minReviews.toString());
  }
  if (filters.hasCashback) {
    params.set("cashback", "true");
  }
  if (tab !== "overall") {
    params.set("tab", tab);
  }
  return params.toString();
}
