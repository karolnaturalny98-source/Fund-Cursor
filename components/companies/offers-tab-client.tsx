"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, Search, XCircle, ArrowUpDown, Filter, TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, Tag, Coins } from "lucide-react";

import { PurchaseButton } from "@/components/companies/purchase-button";
import { DiscountCoupon } from "@/components/custom/discount-coupon";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Card, CardTitle, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/app/providers/currency-client-provider";
import { convertCurrency, formatCurrencyLocalized } from "@/lib/currency";
import type { CompanyPlan, CompanyWithDetails } from "@/lib/types";
import { OffersComparisonChart } from "./offers-comparison-chart";

interface PlansShopListProps {
  company: CompanyWithDetails;
}

function renderModelLabel(model: string) {
  switch (model) {
    case "one-step":
      return "1-etapowe wyzwanie";
    case "two-step":
      return "2-etapowe wyzwanie";
    case "instant-funding":
      return "Instant funding";
    default:
      return model;
  }
}

export function PlansShopList({ company }: PlansShopListProps) {
  const { currency, rates } = useCurrency();

  const plansWithComputed = useMemo(() => {
    return company.plans.map((plan) => {
      const convertedPrice = convertCurrency(
        plan.price,
        plan.currency,
        currency,
        rates,
      );
      const formattedPrice = formatCurrencyLocalized(convertedPrice, currency);
      const showOriginal = plan.currency.toUpperCase() !== currency.toUpperCase();
      const originalPrice = `${plan.price.toLocaleString("pl-PL")} ${plan.currency}`;

      return {
        ...plan,
        convertedPrice,
        formattedPrice,
        showOriginal,
        originalPrice,
      };
    });
  }, [company.plans, currency, rates]);

  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "profitSplit" | "drawdown" | "name">("price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredAndSortedPlans = useMemo(() => {
    let filtered = plansWithComputed;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((plan) =>
        plan.name.toLowerCase().includes(query)
      );
    }

    // Apply model filter
    if (modelFilter) {
      filtered = filtered.filter((plan) => plan.evaluationModel === modelFilter);
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "price") {
        comparison = a.convertedPrice - b.convertedPrice;
      } else if (sortBy === "profitSplit") {
        const aSplit = a.profitSplit ? parseFloat(a.profitSplit) : 0;
        const bSplit = b.profitSplit ? parseFloat(b.profitSplit) : 0;
        comparison = aSplit - bSplit;
      } else if (sortBy === "drawdown") {
        const aDD = a.maxDrawdown || 0;
        const bDD = b.maxDrawdown || 0;
        comparison = aDD - bDD;
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [plansWithComputed, searchQuery, modelFilter, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchQuery("");
    setModelFilter(null);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (modelFilter) count++;
    return count;
  }, [searchQuery, modelFilter]);

  // Calculate statistics - must be before early return
  const stats = useMemo(() => {
    if (plansWithComputed.length === 0) return null;
    const prices = plansWithComputed.map((p) => p.convertedPrice);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const modelDistribution = plansWithComputed.reduce((acc, plan) => {
      acc[plan.evaluationModel] = (acc[plan.evaluationModel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { avgPrice, minPrice, maxPrice, modelDistribution };
  }, [plansWithComputed]);

  if (plansWithComputed.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center rounded-2xl border border-border/60 border-dashed !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] p-16 text-center shadow-sm">
        <div className="mb-4 rounded-full bg-muted/30 p-4">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <CardTitle className="mb-2 text-xl font-semibold">Brak dostępnych planów</CardTitle>
        <CardDescription className="max-w-md text-sm">
          Obecnie nie ma dostępnych planów dla tej firmy.
        </CardDescription>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold sm:text-2xl">Dostępne plany</h2>
        <p className="text-sm text-muted-foreground">
          Wybierz plan, który najlepiej odpowiada Twoim potrzebom. Wszystkie plany dostępne z kodem rabatowym i cashbackiem.
        </p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card className="rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
            <CardContent className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
              <div className="text-3xl font-bold text-foreground">{plansWithComputed.length}</div>
              <CardDescription className="text-xs">Dostępnych planów</CardDescription>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
            <CardContent className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
              <div className="text-3xl font-bold text-foreground">
                {formatCurrencyLocalized(stats.avgPrice, currency)}
              </div>
              <CardDescription className="text-xs">Średnia cena</CardDescription>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
            <CardContent className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
              <div className="text-3xl font-bold text-foreground">
                {formatCurrencyLocalized(stats.minPrice, currency)}
              </div>
              <CardDescription className="text-xs">Najniższa cena</CardDescription>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
            <CardContent className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
              <div className="text-3xl font-bold text-foreground">
                {formatCurrencyLocalized(stats.maxPrice, currency)}
              </div>
              <CardDescription className="text-xs">Najwyższa cena</CardDescription>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Szukaj planu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] pl-9 shadow-sm"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="rounded-full"
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Wyczyść ({activeFiltersCount})
            </Button>
          )}
          {/* Model Filter */}
          <Select value={modelFilter || "all"} onValueChange={(value) => setModelFilter(value === "all" ? null : value)}>
            <SelectTrigger className="w-[160px] rounded-full border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie modele</SelectItem>
              <SelectItem value="one-step">1-etapowe</SelectItem>
              <SelectItem value="two-step">2-etapowe</SelectItem>
              <SelectItem value="instant-funding">Instant funding</SelectItem>
            </SelectContent>
          </Select>
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-[140px] rounded-full border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Cena</SelectItem>
              <SelectItem value="profitSplit">Profit Split</SelectItem>
              <SelectItem value="drawdown">Max Drawdown</SelectItem>
              <SelectItem value="name">Nazwa</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="rounded-full"
          >
            {sortOrder === "asc" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Szybkie filtry:</span>
        <Button
          variant={sortBy === "price" && sortOrder === "asc" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setSortBy("price");
            setSortOrder("asc");
          }}
          className="h-7 rounded-full px-2.5 text-[11px] font-normal"
        >
          <DollarSign className="mr-1 h-2.5 w-2.5" />
          Najtańsze
        </Button>
        <Button
          variant={sortBy === "price" && sortOrder === "desc" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setSortBy("price");
            setSortOrder("desc");
          }}
          className="h-7 rounded-full px-2.5 text-[11px] font-normal"
        >
          <DollarSign className="mr-1 h-2.5 w-2.5" />
          Najdroższe
        </Button>
        <Button
          variant={sortBy === "profitSplit" && sortOrder === "desc" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setSortBy("profitSplit");
            setSortOrder("desc");
          }}
          className="h-7 rounded-full px-2.5 text-[11px] font-normal"
        >
          <Percent className="mr-1 h-2.5 w-2.5" />
          Najwyższy profit split
        </Button>
        <Button
          variant={sortBy === "drawdown" && sortOrder === "asc" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setSortBy("drawdown");
            setSortOrder("asc");
          }}
          className="h-7 rounded-full px-2.5 text-[11px] font-normal"
        >
          <BarChart3 className="mr-1 h-2.5 w-2.5" />
          Najniższy drawdown
        </Button>
      </div>

      {/* Plans List */}
      {filteredAndSortedPlans.length === 0 ? (
        <Card className="rounded-2xl border border-border/60 border-dashed !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted/30 p-4">
              <Search className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <CardTitle className="mb-2 text-xl font-semibold">Nie znaleziono planów</CardTitle>
            <CardDescription className="max-w-md text-sm">
              {activeFiltersCount > 0
                ? "Nie znaleziono planów spełniających wybrane kryteria. Spróbuj zmienić filtry."
                : "Brak dostępnych planów dla tej firmy."}
            </CardDescription>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 rounded-full"
                onClick={clearFilters}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Wyczyść filtry
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredAndSortedPlans.map((plan) => (
            <PlanProductCard
              key={plan.id}
              plan={plan}
              company={company}
            />
          ))}
        </div>
      )}

      {/* Comparison Charts */}
      {plansWithComputed.length > 0 && (
        <OffersComparisonChart
          plans={plansWithComputed.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            convertedPrice: p.convertedPrice,
            formattedPrice: p.formattedPrice,
            evaluationModel: p.evaluationModel,
            currency: p.currency,
          }))}
          currency={currency}
        />
      )}
    </section>
  );
}

interface PlanProductCardProps {
  plan: CompanyPlan & {
    convertedPrice: number;
    formattedPrice: string;
    showOriginal: boolean;
    originalPrice: string;
  };
  company: CompanyWithDetails;
}

function PlanProductCard({ plan, company }: PlanProductCardProps) {
  const purchaseUrl = plan.affiliateUrl || company.websiteUrl || "#";
  const cashbackAmount = company.cashbackRate && plan.convertedPrice
    ? (plan.convertedPrice * company.cashbackRate) / 100
    : null;

  return (
    <Card className={cn(
      "group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-border/40 bg-[rgba(12,14,18,0.6)] !backdrop-blur-[36px] p-3 shadow-sm transition-all duration-200",
      "hover:border-primary/30 hover:shadow-sm",
      "lg:flex-row lg:items-center"
    )}>
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-sm font-medium text-foreground">
            {plan.name}
          </CardTitle>
          <PremiumBadge variant="outline" className="rounded-full text-[10px] font-normal uppercase px-1.5 py-0 border-primary/20">
            {renderModelLabel(plan.evaluationModel)}
          </PremiumBadge>
        </div>

        {/* Additional parameters */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground/70">
          {plan.profitSplit ? (
            <div className="flex items-center gap-1">
              <Percent className="h-3 w-3" />
              <span>Profit Split: <strong className="text-foreground/80">{plan.profitSplit}%</strong></span>
            </div>
          ) : null}
          {plan.maxDrawdown ? (
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span>Max DD: <strong className="text-foreground/80">{plan.maxDrawdown.toLocaleString("pl-PL")}</strong></span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Kod rabatowy */}
          {company.discountCode ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 shadow-sm">
              <Tag className="h-3 w-3 text-emerald-600/80" />
              <Badge variant="outline" className="text-[9px] font-normal uppercase tracking-wide text-emerald-700/80 border-0 bg-transparent px-0">
                Kod:
              </Badge>
              <DiscountCoupon code={company.discountCode} slug={company.slug} className="w-auto" />
            </div>
          ) : null}

          {/* Cashback */}
          {company.cashbackRate && company.cashbackRate > 0 ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2 py-1 shadow-sm">
              <Coins className="h-3 w-3 text-primary/80" />
              <Badge variant="outline" className="text-[9px] font-normal uppercase tracking-wide text-primary/80 border-0 bg-transparent px-0">
                Cashback:
              </Badge>
              <span className="text-xs font-medium text-primary/90">
                {Math.round(company.cashbackRate)}%
              </span>
              {cashbackAmount !== null ? (
                <Badge variant="outline" className="text-[9px] font-normal text-primary/60 border-0 bg-transparent px-0">
                  ({formatCurrencyLocalized(cashbackAmount, "USD")})
                </Badge>
              ) : null}
            </div>
          ) : null}

          {/* Cena */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] !backdrop-blur-[36px] px-2.5 py-1 shadow-sm">
            <DollarSign className="h-3 w-3 text-muted-foreground/70" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-semibold text-foreground">
                {plan.formattedPrice}
              </span>
              {plan.showOriginal ? (
                <Badge variant="outline" className="text-[9px] font-normal text-muted-foreground/60 border-0 bg-transparent px-0">
                  ({plan.originalPrice})
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 lg:w-auto w-full">
        <PurchaseButton
          companySlug={company.slug}
          href={purchaseUrl}
          planId={plan.id}
          variant="premium"
          className="w-full lg:w-auto rounded-full shadow-sm transition-all hover:shadow-md"
        >
          <PremiumIcon icon={ShoppingCart} variant="glow" size="sm" className="mr-2" />
          Kup teraz
        </PurchaseButton>
      </div>
    </Card>
  );
}
