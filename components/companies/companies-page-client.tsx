"use client";

import { useEffect, useState, useTransition, useRef, useMemo, useDeferredValue } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import type {
  Company,
  CompanySortOption,
  EvaluationModel,
} from "@/lib/types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CompaniesFilterPanel } from "@/components/companies/filter-panel";
import { CompanyCard } from "@/components/companies/company-card";
import { CompareProvider } from "@/components/companies/compare-context";
import { CompareBar } from "@/components/companies/compare-bar";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";

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
  
  // Synchronizuj searchDraft z URL - ważne dla back/forward navigation
  const urlSearch = useMemo(() => searchParams.get("search") || "", [searchParams]);
  const [searchDraft, setSearchDraft] = useState(urlSearch);
  const prevSearchRef = useRef<string>(urlSearch);
  
  // Synchronizuj searchDraft gdy URL się zmienia (back/forward)
  useEffect(() => {
    if (urlSearch !== prevSearchRef.current) {
      setSearchDraft(urlSearch);
      prevSearchRef.current = urlSearch;
    }
  }, [urlSearch]);
  
  // Użyj deferred value dla płynniejszych animacji podczas ładowania
  const deferredCompanies = useDeferredValue(companies);
  const isStale = companies !== deferredCompanies;
  
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });
  const cardsAnim = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(deferredCompanies.length, 100);
  // Zachowaj widoczność podczas pending - nie resetuj animacji
  const visibleStaggerItems = cardsAnim.isVisible ? staggerItems : new Array(deferredCompanies.length).fill(false);

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
    
    // Sprawdź czy wartość faktycznie się zmieniła
    if (trimmed === prevSearchRef.current) {
      return; // Nie rób nic jeśli wartość jest taka sama
    }
    
    const handler = window.setTimeout(() => {
      // Sprawdź czy wartość w URL jest już taka sama jak chcemy ustawić
      if (trimmed === urlSearch) {
        prevSearchRef.current = trimmed;
        return; // Nie rób nic jeśli wartość jest już w URL
      }
      
      // Użyj searchParams tylko do odczytu, nie dodawaj do zależności
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
  }, [searchDraft, pathname, router, urlSearch]); // Usuń searchParams - używamy tylko do odczytu

  const applyQuickFilter = (filterType: "top10" | "cashback" | "with-cashback" | "newest") => {
    const params = new URLSearchParams(searchParams);
    
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

  return (
    <CompareProvider initialSelection={initialCompare}>
      <div className="container py-12">
        <div ref={sectionAnim.ref} className={`flex flex-col gap-6 pb-10 ${sectionAnim.className}`}>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Ranking firm prop tradingowych
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Filtrowanie po modelu oceny, kraju, typie konta, minimalnym cashbacku i payoutach
            pozwala szybciej znaleźć najlepszą firmę fundującą konto.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
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

          <section className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Szukaj po nazwie firmy..."
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                className="w-full rounded-full border border-border/60 bg-card/72 backdrop-blur-[36px]! pl-9 shadow-xs"
                disabled={isPending}
              />
              {isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                Szybkie filtry:
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyQuickFilter("top10")}
                className="h-7 rounded-full px-2.5 text-[11px] font-normal"
                disabled={isPending}
              >
                Top 10 ocen
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyQuickFilter("cashback")}
                className="h-7 rounded-full px-2.5 text-[11px] font-normal"
                disabled={isPending}
              >
                Najwyższy cashback
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyQuickFilter("with-cashback")}
                className="h-7 rounded-full px-2.5 text-[11px] font-normal"
                disabled={isPending}
              >
                Z cashbackiem
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyQuickFilter("newest")}
                className="h-7 rounded-full px-2.5 text-[11px] font-normal"
                disabled={isPending}
              >
                Nowości
              </Button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {deferredCompanies.length} firm dostepnych w bazie
                  {activeFilters ? " (wynik po filtrach)" : ""}.
                </p>
                {activeFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams();
                      startTransition(() => {
                        router.replace(pathname);
                      });
                    }}
                    className="h-7 text-xs"
                    disabled={isPending}
                  >
                    Wyczyść wszystkie
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <span>Sortowanie: {sortLabels[sort]}</span>
                {minCashback !== null ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                    Cashback: {minCashback}%
                  </span>
                ) : null}
                {minProfitSplit !== null ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                    Payout: {minProfitSplit}%
                  </span>
                ) : null}
                {selectedModels.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                    {selectedModels.length} model{selectedModels.length > 1 ? "e" : ""}
                  </span>
                )}
                {selectedCountries.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                    {selectedCountries.length} kraj{selectedCountries.length > 1 ? "ów" : ""}
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                    Szukaj: {search}
                  </span>
                )}
              </div>
            </div>

            {isPending && deferredCompanies.length === 0 ? (
              <div className="grid gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-6 shadow-xs"
                  >
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <div className="flex gap-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-8 w-20 rounded-full" />
                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                        <Skeleton className="h-3 w-32" />
                        <div className="flex items-end justify-between gap-4">
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <div className="text-right">
                            <Skeleton className="h-3 w-12 mb-1" />
                            <Skeleton className="h-6 w-20" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-24 rounded-full" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-3 pt-4">
                      <Skeleton className="h-3 w-32" />
                      <div className="flex gap-3">
                        <Skeleton className="h-10 flex-1 rounded-full" />
                        <Skeleton className="h-10 flex-1 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : deferredCompanies.length ? (
              <div ref={cardsAnim.ref} className="grid gap-6 relative">
                {isStale && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-sm pointer-events-none">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
                {deferredCompanies.map((company, index) => (
                  <div
                    key={company.id}
                    className={`transition-all duration-500 ${
                      visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                    } ${isStale ? "opacity-60" : ""}`}
                    style={{ transitionDelay: `${index * 50}ms` } as React.CSSProperties}
                  >
                    <CompanyCard company={company} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border/60 bg-card/72 backdrop-blur-[36px]! p-12 text-center">
                <div className="mx-auto max-w-md space-y-4">
                  <p className="text-base font-semibold text-foreground">
                    Brak firm spelniajacych wybrane kryteria
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Zmien ustawienia filtrow lub wyczysc je, aby zobaczyc wszystkie wpisy.
                  </p>
                  {activeFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        startTransition(() => {
                          router.replace(pathname);
                        });
                      }}
                      className="mt-4"
                      disabled={isPending}
                    >
                      Wyczyść wszystkie filtry
                    </Button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <CompareBar />
    </CompareProvider>
  );
}
