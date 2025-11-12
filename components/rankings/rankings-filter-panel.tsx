"use client";

import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PremiumBadge } from "@/components/custom/premium-badge";

interface ExplorerFilters {
  search: string;
  country: string | null;
  evaluationModel: string | null;
  accountType: string | null;
  minReviews: number;
  hasCashback: boolean;
}

interface FilterPanelProps {
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
}

export function RankingsFilterPanel({
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
}: FilterPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onQuickFilter("top10")}
          className="rounded-full"
        >
          Top 10
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onQuickFilter("highest-cashback")}
          className="rounded-full"
        >
          Najwyższy cashback
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onQuickFilter("most-popular")}
          className="rounded-full"
        >
          Najpopularniejsze
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onQuickFilter("most-reviews")}
          className="rounded-full"
        >
          Najwięcej opinii
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Szukaj firm..."
            value={searchDraft}
            onChange={(e) => onSearchDraftChange(e.target.value)}
            className="pl-9 rounded-full"
          />
        </div>

        <Select
          value={filters.country || ""}
          onValueChange={(value) =>
            onFiltersChange({ country: value || null })
          }
        >
          <SelectTrigger className="w-full md:w-[180px] rounded-full">
            <SelectValue placeholder="Kraj" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Wszystkie kraje</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.evaluationModel || ""}
          onValueChange={(value) =>
            onFiltersChange({ evaluationModel: value || null })
          }
        >
          <SelectTrigger className="w-full md:w-[180px] rounded-full">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Wszystkie modele</SelectItem>
            {evaluationModels.map((model) => (
              <SelectItem key={model} value={model}>
                {model === "one-step" ? "1-etapowe" : model === "two-step" ? "2-etapowe" : "Instant"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.accountType || ""}
          onValueChange={(value) =>
            onFiltersChange({ accountType: value || null })
          }
        >
          <SelectTrigger className="w-full md:w-[180px] rounded-full">
            <SelectValue placeholder="Typ konta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Wszystkie typy</SelectItem>
            {accountTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <PremiumBadge variant="outline" className="text-xs">
            <Filter className="mr-1 h-3 w-3" />
            Aktywne filtry:
          </PremiumBadge>
          {filters.country && (
            <Badge variant="secondary" className="gap-1">
              Kraj: {filters.country}
              <button
                onClick={() => onFilterRemove("country")}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.evaluationModel && (
            <Badge variant="secondary" className="gap-1">
              Model: {filters.evaluationModel === "one-step" ? "1-etapowe" : filters.evaluationModel === "two-step" ? "2-etapowe" : "Instant"}
              <button
                onClick={() => onFilterRemove("evaluationModel")}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.accountType && (
            <Badge variant="secondary" className="gap-1">
              Typ: {filters.accountType}
              <button
                onClick={() => onFilterRemove("accountType")}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.minReviews > 0 && (
            <Badge variant="secondary" className="gap-1">
              Min opinii: {filters.minReviews}
              <button
                onClick={() => onFilterRemove("minReviews")}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.hasCashback && (
            <Badge variant="secondary" className="gap-1">
              Z cashbackiem
              <button
                onClick={() => onFilterRemove("hasCashback")}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-6 rounded-full text-xs"
          >
            Wyczyść wszystkie
          </Button>
        </div>
      )}
    </div>
  );
}

