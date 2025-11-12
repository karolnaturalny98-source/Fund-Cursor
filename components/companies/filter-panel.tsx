"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useFadeIn } from "@/lib/animations";
import type { CompanySortOption, EvaluationModel } from "@/lib/types";

const evaluationOptions: { value: EvaluationModel; label: string }[] = [
  { value: "one-step", label: "1-etapowe wyzwanie" },
  { value: "two-step", label: "2-etapowe wyzwanie" },
  { value: "instant-funding", label: "Instant funding" },
];

const cashbackOptions: { value: string; label: string }[] = [
  { value: "", label: "Dowolny cashback" },
  { value: "3", label: "Minimum 3%" },
  { value: "5", label: "Minimum 5%" },
  { value: "7", label: "Minimum 7%" },
  { value: "10", label: "Minimum 10%" },
];

const sortOptions: { value: CompanySortOption; label: string }[] = [
  { value: "popular", label: "Popularność" },
  { value: "newest", label: "Najnowsze" },
  { value: "cashback", label: "Najwyższy cashback" },
  { value: "rating", label: "Najlepsze oceny" },
  { value: "name", label: "Alfabetycznie" },
];

interface CompaniesFilterPanelProps {
  selectedModels: EvaluationModel[];
  minCashback: number | null;
  countryOptions: string[];
  accountTypeOptions: string[];
  profitSplitOptions: number[];
  selectedCountries: string[];
  selectedAccountTypes: string[];
  minProfitSplit: number | null;
  sort: CompanySortOption;
}

export function CompaniesFilterPanel({
  selectedModels,
  minCashback,
  countryOptions,
  accountTypeOptions,
  profitSplitOptions,
  selectedCountries,
  selectedAccountTypes,
  minProfitSplit,
  sort,
}: CompaniesFilterPanelProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const panelAnim = useFadeIn({ rootMargin: "-50px" });

  const selectedCashback = useMemo(() => {
    if (minCashback === null) {
      return "";
    }

    return String(minCashback);
  }, [minCashback]);

  const selectedPayout = useMemo(() => {
    if (minProfitSplit === null) {
      return "";
    }

    return String(minProfitSplit);
  }, [minProfitSplit]);

  const selectedCountrySet = useMemo(
    () => new Set(selectedCountries),
    [selectedCountries],
  );

  const selectedAccountTypeSet = useMemo(
    () => new Set(selectedAccountTypes),
    [selectedAccountTypes],
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedModels.length > 0) count += selectedModels.length;
    if (minCashback !== null) count += 1;
    if (minProfitSplit !== null) count += 1;
    if (selectedCountries.length > 0) count += selectedCountries.length;
    if (selectedAccountTypes.length > 0) count += selectedAccountTypes.length;
    return count;
  }, [selectedModels, minCashback, minProfitSplit, selectedCountries, selectedAccountTypes]);

  const updateSearchParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams);
    mutate(params);

    startTransition(() => {
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    });
  };

  const toggleModel = (model: EvaluationModel) => {
    updateSearchParams((params) => {
      const current = new Set(params.getAll("model"));

      if (current.has(model)) {
        current.delete(model);
      } else {
        current.add(model);
      }

      params.delete("model");
      Array.from(current).forEach((item) => {
        if (item) {
          params.append("model", item);
        }
      });
    });
  };

  const updateCashback = (value: string) => {
    updateSearchParams((params) => {
      if (!value) {
        params.delete("cashback");
      } else {
        params.set("cashback", value);
      }
    });
  };

  const updatePayout = (value: string) => {
    updateSearchParams((params) => {
      if (!value) {
        params.delete("payout");
      } else {
        params.set("payout", value);
      }
    });
  };

  const toggleCountry = (country: string) => {
    updateSearchParams((params) => {
      const current = new Set(params.getAll("country"));

      if (current.has(country)) {
        current.delete(country);
      } else {
        current.add(country);
      }

      params.delete("country");
      Array.from(current).forEach((item) => {
        if (item) {
          params.append("country", item);
        }
      });
    });
  };

  const toggleAccountType = (accountType: string) => {
    updateSearchParams((params) => {
      const current = new Set(params.getAll("accountType"));

      if (current.has(accountType)) {
        current.delete(accountType);
      } else {
        current.add(accountType);
      }

      params.delete("accountType");
      Array.from(current).forEach((item) => {
        if (item) {
          params.append("accountType", item);
        }
      });
    });
  };

  const updateSort = (value: CompanySortOption) => {
    updateSearchParams((params) => {
      if (value === "popular") {
        params.delete("sort");
      } else {
        params.set("sort", value);
      }
    });
  };

  const resetFilters = () => {
    startTransition(() => {
      router.replace(pathname);
    });
  };

  return (
    <aside ref={panelAnim.ref} className={`space-y-6 rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs p-6 ${panelAnim.className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Sortowanie
          </h2>
        </div>
        <div className="grid gap-2 text-sm">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className={`w-full rounded-md border px-3 py-2 text-left transition-all ${sort === option.value ? "border-primary/50 bg-primary/10 shadow-xs text-primary" : "border-border/60 bg-card/72 text-muted-foreground hover:border-primary/50 hover:bg-card/82 hover:text-foreground"}`}
              disabled={isPending}
              type="button"
              onClick={() => updateSort(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Model oceny
          </h2>
          {selectedModels.length > 0 && (
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
              {selectedModels.length}
            </span>
          )}
        </div>
        <ul className="space-y-2 text-sm">
          {evaluationOptions.map((option) => {
            const isActive = selectedModels.includes(option.value);
            return (
              <li key={option.value}>
                <button
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-all ${isActive ? "border-primary/50 bg-primary/10 shadow-xs text-primary" : "border-border/60 bg-card/72 text-muted-foreground hover:border-primary/50 hover:bg-card/82 hover:text-foreground"}`}
                  disabled={isPending}
                  type="button"
                  onClick={() => toggleModel(option.value)}
                >
                  <span>{option.label}</span>
                  <span className="text-xs uppercase tracking-wide">
                    {isActive ? "Wybrane" : "Filtruj"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Minimalny cashback
          </h2>
          {minCashback !== null && (
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
              ✓
            </span>
          )}
        </div>
        <div className="space-y-2">
          {cashbackOptions.map((option) => (
            <button
              key={option.value || "any"}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-all ${selectedCashback === option.value ? "border-primary/50 bg-primary/10 shadow-xs text-primary" : "border-border/60 bg-card/72 text-muted-foreground hover:border-primary/50 hover:bg-card/82 hover:text-foreground"}`}
              disabled={isPending}
              type="button"
              onClick={() => updateCashback(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {profitSplitOptions.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Minimalny payout
            </h2>
            {minProfitSplit !== null && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                ✓
              </span>
            )}
          </div>
          <div className="space-y-2">
            <button
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-all ${selectedPayout === "" ? "border-primary/50 bg-primary/10 shadow-xs text-primary" : "border-border/60 bg-card/72 text-muted-foreground hover:border-primary/50 hover:bg-card/82 hover:text-foreground"}`}
              disabled={isPending}
              type="button"
              onClick={() => updatePayout("")}
            >
              Dowolny payout
            </button>
            {profitSplitOptions.map((value) => {
              const key = String(value);
              return (
                <button
                  key={key}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-all ${selectedPayout === key ? "border-primary/50 bg-primary/10 shadow-xs text-primary" : "border-border/60 bg-card/72 text-muted-foreground hover:border-primary/50 hover:bg-card/82 hover:text-foreground"}`}
                  disabled={isPending}
                  type="button"
                  onClick={() => updatePayout(key)}
                >
                  Minimum {value}% dla tradera
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {countryOptions.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Kraj siedziby
            </h2>
            {selectedCountries.length > 0 && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                {selectedCountries.length}
              </span>
            )}
          </div>
          <ul className="space-y-2 text-sm">
            {countryOptions.map((country) => {
              const isActive = selectedCountrySet.has(country);
              return (
                <li key={country}>
                  <button
                    className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-all ${isActive ? "border-primary/50 bg-primary/10 shadow-xs text-primary" : "border-border/60 bg-card/72 text-muted-foreground hover:border-primary/50 hover:bg-card/82 hover:text-foreground"}`}
                    disabled={isPending}
                    type="button"
                    onClick={() => toggleCountry(country)}
                  >
                    <span>{country}</span>
                    <span className="text-xs uppercase tracking-wide">
                      {isActive ? "Wybrane" : "Filtruj"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {accountTypeOptions.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Typ konta
            </h2>
            {selectedAccountTypes.length > 0 && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                {selectedAccountTypes.length}
              </span>
            )}
          </div>
          <ul className="space-y-2 text-sm">
            {accountTypeOptions.map((type) => {
              const isActive = selectedAccountTypeSet.has(type);
              return (
                <li key={type}>
                  <button
                    className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-all ${isActive ? "border-primary/50 bg-primary/10 shadow-xs text-primary" : "border-border/60 bg-card/72 text-muted-foreground hover:border-primary/50 hover:bg-card/82 hover:text-foreground"}`}
                    disabled={isPending}
                    type="button"
                    onClick={() => toggleAccountType(type)}
                  >
                    <span>{type}</span>
                    <span className="text-xs uppercase tracking-wide">
                      {isActive ? "Wybrane" : "Filtruj"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {activeFiltersCount > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center text-xs text-muted-foreground">
          <span className="font-semibold text-primary">{activeFiltersCount}</span> aktywnych filtrów
        </div>
      )}
      <Button
        className="w-full rounded-full"
        disabled={isPending || activeFiltersCount === 0}
        variant="premium-outline"
        onClick={resetFilters}
      >
        Wyczyść filtry
      </Button>
    </aside>
  );
}
