"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ArrowUpDown, Filter, RefreshCcw, Search } from "lucide-react";

import { ReviewsRankingTable } from "@/components/reviews/reviews-ranking-table";
import { ReviewsRankingMobileList } from "@/components/reviews/reviews-ranking-mobile-list";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/analysis/loading-skeleton";

const ReviewsCharts = dynamic(
  () => import("@/components/reviews/reviews-charts").then((mod) => ({ default: mod.ReviewsCharts })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
import { ReviewsExportButton } from "@/components/reviews/reviews-export-button";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReviewsRankingResult } from "@/lib/queries/reviews";
import { cn } from "@/lib/utils";

type SortBy = "rating" | "reviews" | "trend" | "favorites";

interface ReviewsRankingPageProps {
  initialData: ReviewsRankingResult;
}

interface FiltersState {
  search: string;
  minReviews: number;
  onlyRecent: boolean;
  sortBy: SortBy;
  sortDirection: "asc" | "desc";
}

const DEFAULT_FILTERS: FiltersState = {
  search: "",
  minReviews: 0,
  onlyRecent: false,
  sortBy: "rating",
  sortDirection: "desc",
};

export function ReviewsRankingPage({ initialData }: ReviewsRankingPageProps) {
  const [data, setData] = useState<ReviewsRankingResult>(initialData);
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [searchDraft, setSearchDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirstFetch = useRef(true);

  const hasActiveFilters = useMemo(() => {
    return (
      (filters.search && filters.search.length > 0) ||
      filters.minReviews > 0 ||
      filters.onlyRecent ||
      filters.sortBy !== DEFAULT_FILTERS.sortBy ||
      filters.sortDirection !== DEFAULT_FILTERS.sortDirection
    );
  }, [filters]);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevSearchDraftRef = useRef<string>(searchDraft);

  useEffect(() => {
    setSearchDraft(DEFAULT_FILTERS.search);
  }, []);

  // Optimized debounce: only update filters when searchDraft changes, not when filters.search changes
  useEffect(() => {
    // Skip if searchDraft hasn't actually changed
    if (searchDraft === prevSearchDraftRef.current) {
      return;
    }
    prevSearchDraftRef.current = searchDraft;

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchDraft.trim(),
      }));
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchDraft]);

  useEffect(() => {
    if (isFirstFetch.current) {
      isFirstFetch.current = false;
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();
    if (filters.search) {
      params.set("search", filters.search);
    }
    if (filters.minReviews > 0) {
      params.set("minReviews", filters.minReviews.toString());
    }
    if (filters.onlyRecent) {
      params.set("onlyRecent", "true");
    }
    if (filters.sortBy !== DEFAULT_FILTERS.sortBy) {
      params.set("sortBy", filters.sortBy);
    }
    if (filters.sortDirection !== DEFAULT_FILTERS.sortDirection) {
      params.set("sortDirection", filters.sortDirection);
    }

    const url = `/api/reviews/ranking${params.toString() ? `?${params.toString()}` : ""}`;

    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Nie udalo sie pobrac danych");
        }
        return response.json();
      })
      .then((payload: ReviewsRankingResult) => {
        setData(payload);
      })
      .catch((fetchError) => {
        if (fetchError.name === "AbortError") {
          return;
        }
        console.error("[reviews] ranking fetch error", fetchError);
        setError("Nie udalo sie odswiezyc rankingu. Sprobuj ponownie.");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [
    filters.search,
    filters.minReviews,
    filters.onlyRecent,
    filters.sortBy,
    filters.sortDirection,
  ]);

  const displaySummary = useMemo(() => {
    return {
      visibleCompanies: data.filteredSummary.totalCompanies,
      visibleReviews: data.filteredSummary.totalReviews,
      newReviews: data.summary.newReviews30d,
    };
  }, [data]);

  return (
    <section className="space-y-[clamp(1.5rem,2.3vw,2.1rem)]">
      <FiltersPanel
        filters={filters}
        searchDraft={searchDraft}
        onSearchChange={setSearchDraft}
        onFiltersChange={setFilters}
        hasActiveFilters={hasActiveFilters}
        loading={loading}
      />

      <div className="flex flex-wrap items-center gap-[clamp(0.55rem,0.85vw,0.8rem)] text-muted-foreground fluid-caption">
        <PremiumBadge variant="glow" className="border-primary/30 bg-primary/10 text-primary">
          Wyswietlane firmy:{" "}
          {displaySummary.visibleCompanies.toLocaleString("pl-PL")}
        </PremiumBadge>
        <PremiumBadge
          variant="outline"
          className="border-primary/30 bg-secondary/20 text-secondary-foreground"
        >
          Opinie w widoku:{" "}
          {displaySummary.visibleReviews.toLocaleString("pl-PL")}
        </PremiumBadge>
        <span className="flex items-center gap-[clamp(0.35rem,0.55vw,0.5rem)]">
          <Filter className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
          Aktualizacja w oparciu o{" "}
          {displaySummary.newReviews.toLocaleString("pl-PL")} nowych opinii.
        </span>
      </div>

      {error ? (
        <div className="rounded-3xl border border-destructive/40 bg-destructive/10 px-[clamp(1.25rem,1.8vw,1.6rem)] py-[clamp(0.85rem,1.2vw,1.1rem)] fluid-caption text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-[clamp(0.85rem,1.3vw,1.2rem)]">
        {data.items.length > 0 && (
          <ReviewsExportButton items={data.items} />
        )}
      </div>

      <div className="hidden lg:block">
        <ReviewsRankingTable
          items={data.items}
          maxReviews={data.maxReviewsCount}
          loading={loading}
        />
      </div>

      <div className="lg:hidden">
        <ReviewsRankingMobileList
          items={data.items}
          maxReviews={data.maxReviewsCount}
          loading={loading}
        />
      </div>

      {data.items.length > 0 && (
        <ReviewsCharts items={data.items} />
      )}
    </section>
  );
}

interface FiltersPanelProps {
  filters: FiltersState;
  searchDraft: string;
  loading: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onFiltersChange: Dispatch<SetStateAction<FiltersState>>;
}

function FiltersPanel({
  filters,
  searchDraft,
  loading,
  hasActiveFilters,
  onSearchChange,
  onFiltersChange,
}: FiltersPanelProps) {
  const applyQuickFilter = (preset: "top10" | "most-reviews" | "recent" | "most-popular") => {
    onFiltersChange(() => ({ ...DEFAULT_FILTERS }));
    switch (preset) {
      case "top10":
        onFiltersChange((prev) => ({
          ...prev,
          sortBy: "rating",
          sortDirection: "desc",
        }));
        break;
      case "most-reviews":
        onFiltersChange((prev) => ({
          ...prev,
          sortBy: "reviews",
          sortDirection: "desc",
        }));
        break;
      case "recent":
        onFiltersChange((prev) => ({
          ...prev,
          onlyRecent: true,
          sortBy: "trend",
          sortDirection: "desc",
        }));
        break;
      case "most-popular":
        onFiltersChange((prev) => ({
          ...prev,
          sortBy: "favorites",
          sortDirection: "desc",
        }));
        break;
    }
  };
  const handleMinReviewsChange = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      onFiltersChange((prev) => ({ ...prev, minReviews: 0 }));
      return;
    }
    onFiltersChange((prev) => ({ ...prev, minReviews: Math.floor(parsed) }));
  };

  const handleSortChange = (value: SortBy) => {
    onFiltersChange((prev) => ({ ...prev, sortBy: value }));
  };

  const toggleSortDirection = () => {
    onFiltersChange((prev) => ({
      ...prev,
      sortDirection: prev.sortDirection === "desc" ? "asc" : "desc",
    }));
  };

  const resetFilters = () => {
    onFiltersChange(() => ({ ...DEFAULT_FILTERS }));
    onSearchChange(DEFAULT_FILTERS.search);
  };

  return (
    <Card className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
      <CardHeader className="pb-[clamp(0.85rem,1.2vw,1.1rem)]">
        <CardTitle className="flex items-center gap-[clamp(0.55rem,0.85vw,0.8rem)] text-[clamp(1rem,0.45vw+0.9rem,1.15rem)] font-semibold text-foreground">
          <Filter className="h-[clamp(1.1rem,0.45vw+1rem,1.25rem)] w-[clamp(1.1rem,0.45vw+1rem,1.25rem)] text-primary" />
          Filtry i sortowanie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
        <div className="mb-[clamp(0.75rem,1.1vw,1rem)] flex flex-wrap items-center gap-[clamp(0.4rem,0.6vw,0.55rem)]">
          <span className="text-[clamp(0.65rem,0.3vw+0.55rem,0.78rem)] uppercase tracking-[0.28em] text-muted-foreground/70">
            Szybkie filtry:
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyQuickFilter("top10")}
            className="h-[clamp(2.2rem,1.6vw+1.8rem,2.6rem)] rounded-full px-[clamp(0.75rem,1.1vw,1rem)] text-[clamp(0.78rem,0.33vw+0.68rem,0.88rem)] font-medium"
          >
            Top 10 ocen
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyQuickFilter("most-reviews")}
            className="h-[clamp(2.2rem,1.6vw+1.8rem,2.6rem)] rounded-full px-[clamp(0.75rem,1.1vw,1rem)] text-[clamp(0.78rem,0.33vw+0.68rem,0.88rem)] font-medium"
          >
            Najwięcej opinii
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyQuickFilter("recent")}
            className="h-[clamp(2.2rem,1.6vw+1.8rem,2.6rem)] rounded-full px-[clamp(0.75rem,1.1vw,1rem)] text-[clamp(0.78rem,0.33vw+0.68rem,0.88rem)] font-medium"
          >
            Najnowsze
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyQuickFilter("most-popular")}
            className="h-[clamp(2.2rem,1.6vw+1.8rem,2.6rem)] rounded-full px-[clamp(0.75rem,1.1vw,1rem)] text-[clamp(0.78rem,0.33vw+0.68rem,0.88rem)] font-medium"
          >
            Najpopularniejsze
          </Button>
        </div>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          {/* Search and Filters Row */}
          <div className="flex flex-col gap-[clamp(0.85rem,1.2vw,1.1rem)] lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Szukaj firmy po nazwie lub slugu..."
                  value={searchDraft}
                  onChange={(event) => onSearchChange(event.target.value)}
                  className="h-[clamp(2.75rem,2vw+2.25rem,3.1rem)] rounded-full border border-border/60 bg-card/72 backdrop-blur-[36px]! pl-9 text-[clamp(0.88rem,0.35vw+0.78rem,0.98rem)] shadow-xs focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="Szukaj firmy"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="rounded-full"
                >
                  Wyczysc filtry
                </Button>
              )}
              <label className="flex items-center gap-[clamp(0.4rem,0.6vw,0.55rem)] text-muted-foreground fluid-caption">
                Min. opinii
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={filters.minReviews}
                  onChange={(event) => handleMinReviewsChange(event.target.value)}
                  className="h-[clamp(2.35rem,1.8vw+1.9rem,2.7rem)] w-[clamp(4.5rem,7vw,5.5rem)] rounded-full border border-border/60 bg-card/72 backdrop-blur-[36px]! text-center text-[clamp(0.78rem,0.33vw+0.68rem,0.88rem)] shadow-xs"
                  aria-label="Minimalna liczba opinii"
                />
              </label>
              <label className="flex cursor-pointer items-center gap-[clamp(0.4rem,0.6vw,0.55rem)] rounded-full border border-border/60 bg-card/72 backdrop-blur-[36px]! px-[clamp(0.85rem,1.3vw,1.15rem)] py-[clamp(0.55rem,0.8vw,0.75rem)] text-muted-foreground fluid-caption transition-colors hover:border-primary/50 hover:text-foreground">
                <Checkbox
                  checked={filters.onlyRecent}
                  onCheckedChange={(checked) =>
                    onFiltersChange((prev) => ({ ...prev, onlyRecent: checked === true }))
                  }
                />
                <span>Tylko aktywne (30 dni)</span>
              </label>
            </div>
          </div>

          {/* Sort Row */}
          <div className="flex flex-wrap items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleSortChange(value as SortBy)}
            >
              <SelectTrigger className="w-[clamp(10rem,16vw,12rem)] rounded-full border border-border/60 bg-card/72 backdrop-blur-[36px]! px-[clamp(0.85rem,1.3vw,1.15rem)] text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] shadow-xs focus-visible:ring-2 focus-visible:ring-primary/40">
                <ArrowUpDown className="mr-[clamp(0.4rem,0.6vw,0.55rem)] h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Ocena</SelectItem>
                <SelectItem value="reviews">Liczba opinii</SelectItem>
                <SelectItem value="trend">Trend 30d</SelectItem>
                <SelectItem value="favorites">Obserwujacy</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleSortDirection}
              className="rounded-full"
            >
              <ArrowUpDown className="mr-[clamp(0.35rem,0.55vw,0.5rem)] h-[clamp(0.9rem,0.35vw+0.8rem,1.05rem)] w-[clamp(0.9rem,0.35vw+0.8rem,1.05rem)]" />
              {filters.sortDirection === "desc" ? "Malejaco" : "Rosnaco"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => onFiltersChange((prev) => ({ ...prev }))}
              disabled={loading}
            >
              <RefreshCcw
                className={cn(
                  "mr-[clamp(0.35rem,0.55vw,0.5rem)] h-[clamp(0.9rem,0.35vw+0.8rem,1.05rem)] w-[clamp(0.9rem,0.35vw+0.8rem,1.05rem)]",
                  loading ? "animate-spin" : undefined,
                )}
              />
              Odswiez
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
