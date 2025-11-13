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
          className="h-[clamp(2.75rem,3.2vw,3.1rem)] w-[clamp(2.75rem,3.2vw,3.1rem)] rounded-xl border border-border/60 bg-card/72 object-contain"
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
    <div className="flex h-[clamp(2.75rem,3.2vw,3.1rem)] w-[clamp(2.75rem,3.2vw,3.1rem)] items-center justify-center rounded-xl border border-border/60 bg-card/72 text-muted-foreground text-[clamp(0.85rem,0.4vw+0.75rem,1rem)] font-semibold">
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
        <div className="rounded-2xl border border-border/60 bg-card/72 p-[clamp(0.85rem,1.2vw,1.05rem)] shadow-xs">
          <div className="text-muted-foreground fluid-caption">Firm</div>
          <div className="text-[clamp(1.5rem,1.9vw,1.8rem)] font-semibold text-foreground">{totalCompanies}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/72 p-[clamp(0.85rem,1.2vw,1.05rem)] shadow-xs">
          <div className="text-muted-foreground fluid-caption">Planów</div>
          <div className="text-[clamp(1.5rem,1.9vw,1.8rem)] font-semibold text-foreground">{totalPlans}</div>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col fluid-stack-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center fluid-stack-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-[clamp(1rem,0.55vw+0.85rem,1.2rem)] w-[clamp(1rem,0.55vw+0.85rem,1.2rem)] -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Szukaj firm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full border border-border/60 bg-card/72 pl-9 shadow-xs backdrop-blur-[36px]! fluid-caption"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center fluid-stack-xs">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[clamp(9rem,12vw,10rem)] rounded-full border border-border/60 bg-card/72 shadow-xs backdrop-blur-[36px]!">
              <ArrowUpDown className="mr-2 h-[clamp(0.95rem,0.5vw+0.75rem,1.1rem)] w-[clamp(0.95rem,0.5vw+0.75rem,1.1rem)]" />
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
      <div className="flex flex-wrap items-center fluid-stack-xs">
        <span className="text-muted-foreground/70 fluid-eyebrow">
          Szybkie filtry:
        </span>
        <Button
          variant={filterBy === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilterBy("all")}
          className="h-auto rounded-full px-[clamp(0.75rem,1.1vw,1rem)] py-[clamp(0.3rem,0.45vw,0.4rem)] text-[clamp(0.75rem,0.35vw+0.65rem,0.85rem)] font-medium"
        >
          Wszystkie
        </Button>
        <Button
          variant={filterBy === "highest-cashback" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilterBy("highest-cashback")}
          className="h-auto rounded-full px-[clamp(0.75rem,1.1vw,1rem)] py-[clamp(0.3rem,0.45vw,0.4rem)] text-[clamp(0.75rem,0.35vw+0.65rem,0.85rem)] font-medium"
        >
          <TrendingUp className="mr-1 h-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)] w-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)]" />
          Najwyższy cashback
        </Button>
        <Button
          variant={filterBy === "popular" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilterBy("popular")}
          className="h-auto rounded-full px-[clamp(0.75rem,1.1vw,1rem)] py-[clamp(0.3rem,0.45vw,0.4rem)] text-[clamp(0.75rem,0.35vw+0.65rem,0.85rem)] font-medium"
        >
          <Star className="mr-1 h-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)] w-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)]" />
          Najpopularniejsze
        </Button>
      </div>

      {/* Companies Grid */}
      {filteredAndSortedCompanies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/40 p-[clamp(1.25rem,1.8vw,1.6rem)] text-center text-muted-foreground fluid-copy">
          Brak firm spełniających kryteria wyszukiwania.
        </div>
      ) : (
        <div className="grid fluid-stack-sm sm:grid-cols-2 lg:grid-cols-3">
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
                <div className="p-[clamp(1rem,1.4vw,1.2rem)]">
                  <div className="flex items-start fluid-stack-sm">
                    <CompanyAvatar name={company.name} logoUrl={company.logoUrl} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between fluid-stack-xs">
                        <h3 className="font-semibold text-foreground leading-tight fluid-copy">
                          {company.name}
                        </h3>
                        {isSelected && (
                          <CheckCircle2 className="h-[clamp(0.9rem,0.5vw+0.75rem,1.05rem)] w-[clamp(0.9rem,0.5vw+0.75rem,1.05rem)] shrink-0 text-primary" />
                        )}
                      </div>
                      {company.shortDescription && (
                        <p className="mt-[clamp(0.35rem,0.5vw,0.45rem)] line-clamp-2 text-muted-foreground fluid-caption">
                          {company.shortDescription}
                        </p>
                      )}
                      <div className="mt-[clamp(0.5rem,0.75vw,0.7rem)] flex flex-wrap items-center fluid-stack-xs">
                        {cashbackRate > 0 && (
                          <Badge variant="outline" className="fluid-badge rounded-full">
                            {cashbackRate}% cashback
                          </Badge>
                        )}
                        {rating && (
                          <Badge variant="outline" className="fluid-badge rounded-full">
                            <Star className="mr-1 h-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)] w-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)] fill-yellow-500 text-yellow-500" />
                            {rating.toFixed(1)}
                          </Badge>
                        )}
                        {company.plans.length > 0 && (
                          <Badge variant="outline" className="fluid-badge rounded-full">
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

