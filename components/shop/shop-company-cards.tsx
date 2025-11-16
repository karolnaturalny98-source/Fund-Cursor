"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, TrendingUp, Star, CheckCircle2, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Surface } from "@/components/ui/surface";
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
          className="fluid-avatar-md rounded-xl border border-border/60 bg-card/72 object-contain"
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
    <div className="flex items-center justify-center fluid-avatar-md rounded-xl border border-border/60 bg-card/72 text-muted-foreground text-sm font-semibold">
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
    <div className="flex flex-col fluid-stack-lg">
      {/* Stats */}
      <div className="grid grid-cols-2 fluid-stack-sm">
        <Surface variant="stats" padding="sm">
          <div className="text-muted-foreground fluid-caption">Firm</div>
          <div className="font-semibold text-foreground fluid-h2">{totalCompanies}</div>
        </Surface>
        <Surface variant="stats" padding="sm">
          <div className="text-muted-foreground fluid-caption">Planów</div>
          <div className="font-semibold text-foreground fluid-h2">{totalPlans}</div>
        </Surface>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col fluid-stack-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center fluid-stack-xs">
          <Surface variant="panel" padding="sm" className="flex flex-1 items-center gap-3">
            <Search className="fluid-icon-md text-muted-foreground" />
            <Input
              placeholder="Szukaj firm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent p-0 text-foreground shadow-none focus-visible:ring-0"
            />
          </Surface>
        </div>
        <div className="flex flex-wrap items-center fluid-stack-xs">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <Surface
              asChild
              variant="pill"
              padding="none"
              className="fluid-select-width px-4 py-2 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.32),0_12px_32px_-32px_rgba(15,23,42,0.24)]"
            >
              <SelectTrigger className="border-none bg-transparent p-0 shadow-none focus:ring-0 focus-visible:ring-0">
                <ArrowUpDown className="mr-2 fluid-icon-md" />
                <SelectValue />
              </SelectTrigger>
            </Surface>
            <SelectContent>
              <SelectItem value="name">Nazwa</SelectItem>
              <SelectItem value="cashback">Cashback</SelectItem>
              <SelectItem value="popular">Popularność</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center fluid-stack-xs">
        <span className="text-muted-foreground/70 fluid-eyebrow">
          Szybkie filtry:
        </span>
        <Button
          variant={filterBy === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilterBy("all")}
          className="fluid-pill font-medium"
        >
          Wszystkie
        </Button>
        <Button
          variant={filterBy === "highest-cashback" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilterBy("highest-cashback")}
          className="fluid-pill font-medium"
        >
          <TrendingUp className="mr-1 fluid-icon-sm" />
          Najwyższy cashback
        </Button>
        <Button
          variant={filterBy === "popular" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilterBy("popular")}
          className="fluid-pill font-medium"
        >
          <Star className="mr-1 fluid-icon-sm" />
          Najpopularniejsze
        </Button>
      </div>

      {/* Companies Grid */}
      {filteredAndSortedCompanies.length === 0 ? (
        <Surface
          variant="outline"
          padding="lg"
          className="border-dashed text-center text-muted-foreground fluid-copy"
        >
          Brak firm spełniających kryteria wyszukiwania.
        </Surface>
      ) : (
        <div className="grid fluid-stack-sm sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedCompanies.map((company) => {
            const cashbackRate = company.cashbackRate ?? 0;
            const isSelected = company.id === selectedCompanyId;
            const rating = typeof company.rating === "number" ? company.rating : null;

            return (
              <Card
                key={company.id}
                variant={isSelected ? "elevated" : "muted"}
                className={cn(
                  "cursor-pointer transition-all",
                  !isSelected && "hover:border-primary/40 hover:shadow-md",
                  isSelected && "border-primary/60 ring-2 ring-primary/20"
                )}
                onClick={() => onCompanyChange(company.id)}
              >
                <div className="fluid-card-pad-md">
                  <div className="flex items-start gap-4">
                    <CompanyAvatar name={company.name} logoUrl={company.logoUrl} />
                    <div className="flex-1 min-w-0 flex flex-col fluid-stack-sm">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground leading-tight fluid-copy">
                          {company.name}
                        </h3>
                        {isSelected && (
                          <CheckCircle2 className="fluid-icon-md shrink-0 text-primary" />
                        )}
                      </div>
                      {company.shortDescription && (
                        <p className="text-muted-foreground fluid-caption line-clamp-2">
                          {company.shortDescription}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        {cashbackRate > 0 && (
                          <Badge variant="outline" className="fluid-pill border-border/60 text-xs font-medium">
                            {cashbackRate}% cashback
                          </Badge>
                        )}
                        {rating && (
                          <Badge variant="outline" className="fluid-pill border-border/60 text-xs font-medium">
                            <Star className="mr-1 fluid-icon-sm fill-yellow-500 text-yellow-500" />
                            {rating.toFixed(1)}
                          </Badge>
                        )}
                        {company.plans.length > 0 && (
                          <Badge variant="outline" className="fluid-pill border-border/60 text-xs font-medium">
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
