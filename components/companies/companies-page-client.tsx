"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Search } from "lucide-react";

import type {
  Company,
  CompanySortOption,
  EvaluationModel,
} from "@/lib/types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import AnimatedList from "@/components/AnimatedList";
import { CompaniesFilterPanel } from "@/components/companies/filter-panel";
import { CompanyDirectoryRow } from "@/components/companies/company-directory-row";
import { CompareProvider } from "@/components/companies/compare-context";
import { CompareBar } from "@/components/companies/compare-bar";
import { useFadeIn } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface CompaniesPageClientProps {
  companies: Company[];
  minCashback: number | null;
  selectedModels: EvaluationModel[];
  activeFilters: boolean;
  initialCompare: string[];
  countryOptions: string[];
  accountTypeOptions: string[];
  profitSplitOptions: number[];
  selectedCountries: string[];
  selectedAccountTypes: string[];
  minProfitSplit: number | null;
  sort: CompanySortOption;
  search: string | null;
}

export function CompaniesPageClient({
  companies,
  minCashback,
  selectedModels,
  activeFilters,
  initialCompare,
  countryOptions,
  accountTypeOptions,
  profitSplitOptions,
  selectedCountries,
  selectedAccountTypes,
  minProfitSplit,
  sort,
  search,
}: CompaniesPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const headerAnim = useFadeIn({ rootMargin: "-80px" });

  const urlSearch = useMemo(
    () => searchParams.get("search") ?? search ?? "",
    [searchParams, search],
  );
  const [searchDraft, setSearchDraft] = useState(urlSearch);
  const prevSearchRef = useRef<string>(urlSearch);

  useEffect(() => {
    if (urlSearch !== prevSearchRef.current) {
      setSearchDraft(urlSearch);
      prevSearchRef.current = urlSearch;
    }
  }, [urlSearch]);

  const deferredCompanies = useDeferredValue(companies);
  const isStale = companies !== deferredCompanies;

  const sortLabels: Record<CompanySortOption, string> = {
    popular: "Popularność",
    newest: "Najnowsze",
    cashback: "Najwyższy cashback",
    rating: "Najlepsze oceny",
    reviews: "Najwięcej opinii",
    name: "Alfabetycznie",
  };

  useEffect(() => {
    const trimmed = searchDraft.trim();

    if (trimmed === prevSearchRef.current) {
      return;
    }

    const handler = window.setTimeout(() => {
      if (trimmed === urlSearch) {
        prevSearchRef.current = trimmed;
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (trimmed.length > 0) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }

      prevSearchRef.current = trimmed;
      startTransition(() => {
        const query = params.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`);
      });
    }, 300);

    return () => {
      window.clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft, pathname, router, urlSearch]);

  const applyQuickFilter = (
    filterType: "top10" | "cashback" | "with-cashback" | "newest",
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    switch (filterType) {
      case "top10":
        params.set("sort", "rating");
        params.delete("cashback");
        params.delete("model");
        break;
      case "cashback":
        params.set("sort", "cashback");
        params.delete("model");
        break;
      case "with-cashback":
        params.set("cashback", "1");
        params.delete("sort");
        break;
      case "newest":
        params.set("sort", "newest");
        params.delete("cashback");
        params.delete("model");
        break;
    }

    startTransition(() => {
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    });
  };

  const stats = useMemo(() => {
    const cashbackCount = deferredCompanies.filter(
      (company) =>
        typeof company.cashbackRate === "number" && company.cashbackRate > 0,
    ).length;
    const instantCount = deferredCompanies.filter((company) =>
      (company.plans ?? []).some(
        (plan) => plan.evaluationModel === "instant-funding",
      ),
    ).length;
    const ratedCompanies = deferredCompanies.filter(
      (company) => typeof company.rating === "number",
    );
    const ratingAverage = ratedCompanies.length
      ? ratedCompanies.reduce(
          (sum, company) => sum + (company.rating ?? 0),
          0,
        ) / ratedCompanies.length
      : null;

    return {
      total: deferredCompanies.length,
      cashbackCount,
      instantCount,
      ratingAverage,
    };
  }, [deferredCompanies]);

  const activeFilterBadges = useMemo(() => {
    const badges: string[] = [];
    if (minCashback !== null) {
      badges.push(`Cashback ≥ ${minCashback}%`);
    }
    if (minProfitSplit !== null) {
      badges.push(`Payout ≥ ${minProfitSplit}%`);
    }
    if (selectedModels.length > 0) {
      badges.push(`${selectedModels.length} modele oceny`);
    }
    if (selectedCountries.length > 0) {
      badges.push(`${selectedCountries.length} krajów`);
    }
    if (selectedAccountTypes.length > 0) {
      badges.push(`${selectedAccountTypes.length} typów kont`);
    }
    return badges;
  }, [
    minCashback,
    minProfitSplit,
    selectedModels.length,
    selectedCountries.length,
    selectedAccountTypes.length,
  ]);

  const quickFilterButtons: {
    id: "top10" | "cashback" | "with-cashback" | "newest";
    label: string;
  }[] = [
    { id: "top10", label: "Top oceny" },
    { id: "cashback", label: "Najwyższy cashback" },
    { id: "with-cashback", label: "Tylko z cashbackiem" },
    { id: "newest", label: "Najnowsze firmy" },
  ];

  const showSkeletons = !deferredCompanies.length && isPending;

  const spotlightItems = useMemo(() => {
    if (!deferredCompanies.length) {
      return [];
    }

    return [...deferredCompanies]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 8)
      .map((company) => {
        const cashbackLabel =
          typeof company.cashbackRate === "number" && company.cashbackRate > 0
            ? ` • ${company.cashbackRate}% cashback`
            : "";
        return `${company.name}${cashbackLabel}`;
      });
  }, [deferredCompanies]);

  return (
    <CompareProvider initialSelection={initialCompare}>
      <div className="container space-y-8 py-[clamp(2.5rem,3.2vw,3.5rem)]">
        <section
          ref={headerAnim.ref}
          className={cn(
            "space-y-6 rounded-[32px] border border-border/60 bg-card/70 p-8 shadow-sm backdrop-blur-xl",
            headerAnim.className,
          )}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Baza prop firm
              </p>
              <h1 className="fluid-h1 font-bold text-foreground">
                Wszystkie prop firmy w jednym miejscu
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground">
                Zwarty katalog firm z cashbackiem, planami i regulaminami. Użyj
                filtrów, aby znaleźć idealne wyzwanie i przejdź z kodem, żeby
                odebrać cashback.
              </p>
            </div>
            <Badge
              variant="outline"
              className="w-fit text-xs uppercase tracking-[0.3em]"
            >
              Aktualizacje w czasie rzeczywistym
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Firm w bazie"
              value={stats.total}
              caption={activeFilters ? "Wynik po filtrach" : "Pełna baza"}
            />
            <StatTile
              label="Z cashbackiem"
              value={stats.cashbackCount}
              caption="Wymaga zgłoszenia po zakupie"
            />
            <StatTile
              label="Instant funding"
              value={stats.instantCount}
              caption="Firmy z natychmiastowym kontem"
            />
            <StatTile
              label="Średnia ocena"
              value={stats.ratingAverage ? stats.ratingAverage.toFixed(1) : "–"}
              caption="Na podstawie opinii"
            />
          </div>
        </section>

        <section className="space-y-6 rounded-[28px] border border-border/60 bg-card/70 p-6 shadow-xs backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Szukaj po nazwie firmy..."
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-background/70 pl-9 shadow-xs"
                disabled={isPending}
              />
              {isPending && (
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Filter className="h-4 w-4 text-primary" />
              Sortowanie:
              <span className="font-semibold text-foreground">
                {sortLabels[sort]}
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(240px,0.7fr)]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                  Szybkie filtry
                </span>
                {quickFilterButtons.map((filter) => (
                  <Button
                    key={filter.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full px-4"
                    disabled={isPending}
                    onClick={() => applyQuickFilter(filter.id)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>

              <CompaniesFilterPanel
                minCashback={minCashback}
                selectedModels={selectedModels}
                countryOptions={countryOptions}
                accountTypeOptions={accountTypeOptions}
                profitSplitOptions={profitSplitOptions}
                selectedCountries={selectedCountries}
                selectedAccountTypes={selectedAccountTypes}
                minProfitSplit={minProfitSplit}
                sort={sort}
              />

              {activeFilterBadges.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  {activeFilterBadges.map((badge) => (
                    <Badge
                      key={badge}
                      variant="outline"
                      className="rounded-full border-dashed"
                    >
                      {badge}
                    </Badge>
                  ))}
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() => {
                        router.replace(pathname);
                      })
                    }
                  >
                    Wyczyść wszystko
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-border/50 bg-background/70 p-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                    Najczęściej oglądane
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    Firmy dodane do porównań
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  Live
                </Badge>
              </div>
              <div className="mt-4">
                <AnimatedList
                  items={
                    spotlightItems.length
                      ? spotlightItems
                      : ["Brak danych – zacznij od swoich filtrów"]
                  }
                  enableArrowNavigation={false}
                  displayScrollbar={false}
                  showGradients={false}
                  className="w-full"
                  itemClassName="border-border/30 bg-card/80"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {deferredCompanies.length} firm w tabeli
              {activeFilters ? " (po filtrach)." : " (pełna lista)."}
            </p>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
              Aktualne sortowanie: {sortLabels[sort]}
            </p>
          </div>

          <div className="relative space-y-4">
            {isStale && (
              <div className="pointer-events-none absolute inset-0 z-10 rounded-[28px] bg-background/60 backdrop-blur-sm">
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              </div>
            )}

            {showSkeletons ? (
              Array.from({ length: 4 }).map((_, index) => (
                <DirectorySkeleton key={`skeleton-${index}`} />
              ))
            ) : deferredCompanies.length ? (
              deferredCompanies.map((company, index) => (
                <CompanyDirectoryRow
                  key={company.id}
                  company={company}
                  index={index}
                />
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-border/70 p-10 text-center">
                <p className="text-base font-semibold text-foreground">
                  Brak firm spełniających kryteria
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Zmień ustawienia filtrów lub wyczyść je, aby wrócić do pełnej listy.
                </p>
                {activeFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      startTransition(() => {
                        router.replace(pathname);
                      })
                    }
                    disabled={isPending}
                  >
                    Wyczyść wszystkie filtry
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <CompareBar />
    </CompareProvider>
  );
}

function DirectorySkeleton() {
  return (
    <div className="rounded-[28px] border border-border/60 bg-card/60 p-5 shadow-xs">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-10 w-16 rounded-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: number | string;
  caption: string;
}

function StatTile({ label, value, caption }: StatTileProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/60 p-4 shadow-xs">
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{caption}</p>
    </div>
  );
}
