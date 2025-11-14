"use client";

import { useCallback, useMemo, useTransition } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompanySortOption, EvaluationModel } from "@/lib/types";

const evaluationOptions: { value: EvaluationModel; label: string }[] = [
  { value: "one-step", label: "1-etapowe wyzwanie" },
  { value: "two-step", label: "2-etapowe wyzwanie" },
  { value: "instant-funding", label: "Instant funding" },
];

const CASHBACK_DEFAULT_VALUE = "any-cashback";
const PAYOUT_DEFAULT_VALUE = "any-payout";

const cashbackOptions: { value: string; label: string }[] = [
  { value: CASHBACK_DEFAULT_VALUE, label: "Dowolny cashback" },
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

  const selectedCashback = useMemo(() => {
    if (minCashback === null) {
      return CASHBACK_DEFAULT_VALUE;
    }

    return String(minCashback);
  }, [minCashback]);

  const selectedPayout = useMemo(() => {
    if (minProfitSplit === null) {
      return PAYOUT_DEFAULT_VALUE;
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
  }, [
    selectedModels,
    minCashback,
    minProfitSplit,
    selectedCountries,
    selectedAccountTypes,
  ]);

  const updateSearchParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);

      startTransition(() => {
        const query = params.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`);
      });
    },
    [searchParams, pathname, router, startTransition],
  );

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
      if (value === CASHBACK_DEFAULT_VALUE) {
        params.delete("cashback");
      } else {
        params.set("cashback", value);
      }
    });
  };

  const updatePayout = (value: string) => {
    updateSearchParams((params) => {
      if (value === PAYOUT_DEFAULT_VALUE) {
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
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="min-w-[200px] flex-1 sm:flex-none">
          <Select value={sort} onValueChange={(value) => updateSort(value as CompanySortOption)} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Sortowanie" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[180px]">
          <Select value={selectedCashback} onValueChange={updateCashback} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Minimalny cashback" />
            </SelectTrigger>
            <SelectContent>
              {cashbackOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {profitSplitOptions.length ? (
          <div className="min-w-[200px]">
            <Select value={selectedPayout} onValueChange={updatePayout} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Minimalny payout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PAYOUT_DEFAULT_VALUE}>Dowolny payout</SelectItem>
                {profitSplitOptions.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    Minimum {value}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <FilterDropdown
          label="Model oceny"
          count={selectedModels.length}
          disabled={isPending}
        >
          {evaluationOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedModels.includes(option.value)}
              onCheckedChange={() => toggleModel(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </FilterDropdown>

        {countryOptions.length ? (
          <FilterDropdown
            label="Kraj siedziby"
            count={selectedCountries.length}
            disabled={isPending}
          >
            {countryOptions.map((country) => (
              <DropdownMenuCheckboxItem
                key={country}
                checked={selectedCountrySet.has(country)}
                onCheckedChange={() => toggleCountry(country)}
              >
                {country}
              </DropdownMenuCheckboxItem>
            ))}
          </FilterDropdown>
        ) : null}

        {accountTypeOptions.length ? (
          <FilterDropdown
            label="Typ konta"
            count={selectedAccountTypes.length}
            disabled={isPending}
          >
            {accountTypeOptions.map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={selectedAccountTypeSet.has(type)}
                onCheckedChange={() => toggleAccountType(type)}
              >
                {type}
              </DropdownMenuCheckboxItem>
            ))}
          </FilterDropdown>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <Badge variant="outline" className="rounded-full border-dashed">
          Aktywne filtry: {activeFiltersCount}
        </Badge>
        <span>Kliknij w przyciski powyżej, aby zawęzić listę.</span>
        <Button
          className="rounded-full px-4"
          disabled={isPending || activeFiltersCount === 0}
          variant="outline"
          onClick={resetFilters}
        >
          Wyczyść filtry
        </Button>
      </div>
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  count?: number;
  disabled?: boolean;
  children: ReactNode;
}

function FilterDropdown({ label, count = 0, disabled, children }: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="inline-flex items-center gap-2 rounded-full border-dashed px-4"
          disabled={disabled}
        >
          {label}
          {count > 0 ? (
            <Badge variant="outline" className="border-primary/60 text-primary">
              {count}
            </Badge>
          ) : null}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <div className="max-h-64 overflow-y-auto">{children}</div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
