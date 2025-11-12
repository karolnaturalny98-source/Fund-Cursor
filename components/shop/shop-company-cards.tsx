"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, TrendingUp, Star, CheckCircle2, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CompanyWithPlans } from "@/lib/queries/companies";

interface ShopCompanyCardsProps {
  companies: CompanyWithPlans[];
  selectedCompanyId: string;
  onCompanyChange: (companyId: string) => void;
}

type SortOption = "name" | "cashback" | "popular";
type FilterOption = "all" | "highest-cashback" | "popular";

function CompanyAvatar({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  if (logoUrl) {
    return (
      <div className="relative">
        <Image
          src={logoUrl}
          alt={name}
          width={48}
          height={48}
          className="h-12 w-12 rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] object-contain"
        />
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
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] text-sm font-semibold text-muted-foreground">
      {initials}
    </div>
  );
}

export function ShopCompanyCards({
  companies,
  selectedCompanyId,
  onCompanyChange,
}: ShopCompanyCardsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          company.shortDescription?.toLowerCase().includes(query)
      );
    }

    // Apply filter option
    if (filterBy === "highest-cashback") {
      filtered = filtered
        .filter((c) => (c.cashbackRate ?? 0) > 0)
        .sort((a, b) => (b.cashbackRate ?? 0) - (a.cashbackRate ?? 0));
    } else if (filterBy === "popular") {
      filtered = filtered.sort((a, b) => {
        const aRating = typeof a.rating === "number" ? a.rating : 0;
        const bRating = typeof b.rating === "number" ? b.rating : 0;
        return bRating - aRating;
      });
    }

    // Apply sort option
    if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "cashback") {
      filtered = [...filtered].sort(
        (a, b) => (b.cashbackRate ?? 0) - (a.cashbackRate ?? 0)
      );
    } else if (sortBy === "popular") {
      filtered = [...filtered].sort((a, b) => {
        const aRating = typeof a.rating === "number" ? a.rating : 0;
        const bRating = typeof b.rating === "number" ? b.rating : 0;
        return bRating - aRating;
      });
    }

    return filtered;
  }, [companies, searchQuery, sortBy, filterBy]);

  const totalCompanies = companies.length;
  const totalPlans = companies.reduce((sum, c) => sum + c.plans.length, 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border/60 !bg-[rgba(10,12,15,0.72)] p-3">
          <div className="text-xs text-muted-foreground">Firm</div>
          <div className="text-xl font-semibold">{totalCompanies}</div>
        </div>
        <div className="rounded-lg border border-border/60 !bg-[rgba(10,12,15,0.72)] p-3">
          <div className="text-xs text-muted-foreground">Planów</div>
          <div className="text-xl font-semibold">{totalPlans}</div>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Szukaj firm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] pl-9 shadow-sm"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[160px] rounded-full border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nazwa</SelectItem>
              <SelectItem value="cashback">Cashback</SelectItem>
              <SelectItem value="popular">Popularność</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
          Szybkie filtry:
        </span>
        <Button
          variant={filterBy === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilterBy("all")}
          className="h-7 rounded-full px-2.5 text-[11px] font-normal"
        >
          Wszystkie
        </Button>
        <Button
          variant={filterBy === "highest-cashback" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilterBy("highest-cashback")}
          className="h-7 rounded-full px-2.5 text-[11px] font-normal"
        >
          <TrendingUp className="mr-1 h-2.5 w-2.5" />
          Najwyższy cashback
        </Button>
        <Button
          variant={filterBy === "popular" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilterBy("popular")}
          className="h-7 rounded-full px-2.5 text-[11px] font-normal"
        >
          <Star className="mr-1 h-2.5 w-2.5" />
          Najpopularniejsze
        </Button>
      </div>

      {/* Companies Grid */}
      {filteredAndSortedCompanies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-8 text-center text-sm text-muted-foreground">
          Brak firm spełniających kryteria wyszukiwania.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedCompanies.map((company) => {
            const cashbackRate = company.cashbackRate ?? 0;
            const isSelected = company.id === selectedCompanyId;
            const rating = typeof company.rating === "number" ? company.rating : null;

            return (
              <Card
                key={company.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50 hover:shadow-md",
                  isSelected && "border-primary bg-primary/5 shadow-md"
                )}
                onClick={() => onCompanyChange(company.id)}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <CompanyAvatar name={company.name} logoUrl={company.logoUrl} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-tight">
                          {company.name}
                        </h3>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        )}
                      </div>
                      {company.shortDescription && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {company.shortDescription}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {cashbackRate > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {cashbackRate}% cashback
                          </Badge>
                        )}
                        {rating && (
                          <Badge variant="outline" className="text-xs">
                            <Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {rating.toFixed(1)}
                          </Badge>
                        )}
                        {company.plans.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {company.plans.length} plan{company.plans.length !== 1 ? "ów" : ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

