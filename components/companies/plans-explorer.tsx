"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ExternalLink, LineChart, Search, Filter, XCircle, ArrowUpDown } from "lucide-react";
import { useFadeIn } from "@/lib/animations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { PurchaseButton } from "@/components/companies/purchase-button";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { useCurrency } from "@/app/providers/currency-client-provider";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  convertCurrency,
  formatCurrencyLocalized,
  type CurrencyRates,
} from "@/lib/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CompanyPlan, PriceHistoryPoint, SupportedCurrency } from "@/lib/types";

interface PlansExplorerProps {
  plans: CompanyPlan[];
  companySlug: string;
  cashbackRate: number | null | undefined;
  initialModelFilter?: string | null;
  onModelFilterChange?: (model: string | null) => void;
}

type ViewMode = "cards" | "table";

interface PlanWithComputed extends CompanyPlan {
  convertedPrice: number;
  convertedMaxDrawdown: number | null;
  convertedMaxDailyLoss: number | null;
  convertedProfitTarget: number | null;
  cashbackPoints: number | null;
  changePercent: number | null;
  changeLabel: string | null;
  changeDirection: "up" | "down" | "flat";
  history: PriceHistoryPoint[];
}

export function PlansExplorer({
  plans,
  companySlug,
  cashbackRate,
  initialModelFilter,
  onModelFilterChange,
}: PlansExplorerProps) {
  const { currency, setCurrency, rates } = useCurrency();
  const normalizedPlans = useMemo(
    () =>
      plans.map((plan) => ({
        ...plan,
        history: [...(plan.priceHistory ?? [])].reverse(),
      })),
    [plans],
  );

  const detectedCurrency = useMemo<SupportedCurrency | null>(() => {
    const first = normalizedPlans[0]?.currency?.toUpperCase();
    if (first && SUPPORTED_CURRENCIES.includes(first as SupportedCurrency)) {
      return first as SupportedCurrency;
    }
    return null;
  }, [normalizedPlans]);

  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(initialModelFilter || null);
  const [sortBy, setSortBy] = useState<"price" | "profitSplit" | "drawdown" | "name">("price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const hasAutoSelectedCurrency = useRef(false);

  useEffect(() => {
    if (hasAutoSelectedCurrency.current) {
      return;
    }
    if (!detectedCurrency) {
      hasAutoSelectedCurrency.current = true;
      return;
    }
    if (
      currency === DEFAULT_CURRENCY &&
      detectedCurrency !== DEFAULT_CURRENCY
    ) {
      setCurrency(detectedCurrency, { source: "auto" });
    }
    hasAutoSelectedCurrency.current = true;
  }, [currency, detectedCurrency, setCurrency]);

  useEffect(() => {
    if (initialModelFilter !== undefined && initialModelFilter !== selectedModel) {
      setSelectedModel(initialModelFilter);
    }
  }, [initialModelFilter, selectedModel]);

  const plansWithComputed = useMemo<PlanWithComputed[]>(() => {
    let filtered = normalizedPlans.map((plan) => {
      const convertedPrice = convertCurrency(
        plan.price,
        plan.currency,
        currency,
        rates,
      );
      const convertValue = (value: number | null | undefined) =>
        value === null || value === undefined
          ? null
          : convertCurrency(value, plan.currency, currency, rates);

      const cashbackPoints =
        cashbackRate && cashbackRate > 0
          ? Number.parseFloat(((plan.price * cashbackRate) / 100).toFixed(2))
          : null;

      const change = computeChange(plan.history, currency, rates);

      return {
        ...plan,
        convertedPrice,
        convertedMaxDrawdown: convertValue(plan.maxDrawdown),
        convertedMaxDailyLoss: convertValue(plan.maxDailyLoss),
        convertedProfitTarget: convertValue(plan.profitTarget),
        cashbackPoints,
        changePercent: change.percent,
        changeLabel: change.label,
        changeDirection: change.direction,
      };
    });

    // Filtrowanie po wyszukiwarce
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((plan) =>
        plan.name.toLowerCase().includes(query)
      );
    }

    // Filtrowanie po modelu wyzwania
    if (selectedModel) {
      filtered = filtered.filter((plan) => {
        if (selectedModel === "instant") return plan.evaluationModel === "instant-funding";
        if (selectedModel === "one-step") return plan.evaluationModel === "one-step";
        if (selectedModel === "two-step") return plan.evaluationModel === "two-step";
        return true;
      });
    }

    // Sortowanie
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "price") {
        comparison = a.convertedPrice - b.convertedPrice;
      } else if (sortBy === "profitSplit") {
        const splitA = parseProfitSplit(a.profitSplit);
        const splitB = parseProfitSplit(b.profitSplit);
        comparison = (splitA || 0) - (splitB || 0);
      } else if (sortBy === "drawdown") {
        const ddA = a.convertedMaxDrawdown || 0;
        const ddB = b.convertedMaxDrawdown || 0;
        comparison = ddA - ddB;
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [normalizedPlans, currency, rates, cashbackRate, searchQuery, selectedModel, sortBy, sortOrder]);

  function parseProfitSplit(split: string | null | undefined): number {
    if (!split) return 0;
    const match = /^(\d{1,3})/.exec(split);
    if (!match) return 0;
    return Number.parseInt(match[1], 10) || 0;
  }

  // Hooks must be called before any early returns
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });

  if (!normalizedPlans.length) {
    return null;
  }

  return (
    <section id="plany" ref={sectionAnim.ref} className={`space-y-6 ${sectionAnim.className}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Plany kont</h2>
          <p className="text-sm text-muted-foreground">
            Przelacz walute, aby szybko porownac ceny i limity ryzyka. Dane
            uwzgledniaja ostatnie zmiany cen planow.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
            Waluta
            <Select
              value={currency}
              onValueChange={(value) =>
                setCurrency(value as SupportedCurrency, {
                  source: "user",
                })
              }
            >
              <SelectTrigger className="w-[120px] rounded-full border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! px-3 py-1 text-xs font-semibold text-foreground shadow-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-muted-foreground">
              Widok
            </span>
            <div className="rounded-full border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-1 shadow-xs">
              <button
                type="button"
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                  viewMode === "cards"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setViewMode("cards")}
              >
                Lista
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setViewMode("table")}
              >
                Tabela
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Szukaj planu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! pl-9 shadow-xs"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(searchQuery.trim() || selectedModel) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedModel(null);
                onModelFilterChange?.(null);
              }}
              className="rounded-full"
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Wyczyść
            </Button>
          )}
          {/* Model Filter */}
          <Select
            value={selectedModel || "all"}
            onValueChange={(value) => {
              const newValue = value === "all" ? null : value;
              setSelectedModel(newValue);
              onModelFilterChange?.(newValue);
            }}
          >
            <SelectTrigger className="w-[160px] rounded-full border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie modele</SelectItem>
              <SelectItem value="instant">Instant funding</SelectItem>
              <SelectItem value="one-step">1-etapowe</SelectItem>
              <SelectItem value="two-step">2-etapowe</SelectItem>
            </SelectContent>
          </Select>
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-[140px] rounded-full border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
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
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Szybkie filtry:</span>
        <Button
          variant={selectedModel === null && !searchQuery.trim() ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setSelectedModel(null);
            setSearchQuery("");
            onModelFilterChange?.(null);
          }}
          className="h-7 rounded-full px-2.5 text-[11px] font-normal"
        >
          Wszystkie
        </Button>
        <Button
          variant={selectedModel === "instant" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            const newValue = selectedModel === "instant" ? null : "instant";
            setSelectedModel(newValue);
            onModelFilterChange?.(newValue);
          }}
          className="h-7 rounded-full px-2.5 text-[11px] font-normal"
        >
          Instant funding
        </Button>
        <Button
          variant={selectedModel === "one-step" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            const newValue = selectedModel === "one-step" ? null : "one-step";
            setSelectedModel(newValue);
            onModelFilterChange?.(newValue);
          }}
          className="h-7 rounded-full px-2.5 text-[11px] font-normal"
        >
          1-etapowe
        </Button>
        <Button
          variant={selectedModel === "two-step" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            const newValue = selectedModel === "two-step" ? null : "two-step";
            setSelectedModel(newValue);
            onModelFilterChange?.(newValue);
          }}
          className="h-7 rounded-full px-2.5 text-[11px] font-normal"
        >
          2-etapowe
        </Button>
      </div>

      {plansWithComputed.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-8 text-center shadow-xs">
          <p className="text-sm text-muted-foreground">
            Brak planów spełniających wybrane kryteria.
          </p>
        </div>
      ) : null}

      {viewMode === "cards" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {plansWithComputed.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              companySlug={companySlug}
              displayCurrency={currency}
            />
          ))}
        </div>
      ) : (
        <PlanComparisonTable plans={plansWithComputed} currency={currency} />
      )}
    </section>
  );
}

function PlanCard({
  plan,
  companySlug,
  displayCurrency,
}: {
  plan: PlanWithComputed;
  companySlug: string;
  displayCurrency: SupportedCurrency;
}) {
  const formattedPrice = formatCurrencyLocalized(
    plan.convertedPrice,
    displayCurrency,
  );
  const showOriginal = plan.currency.toUpperCase() !== displayCurrency;
  const changeBadge =
    plan.changeDirection === "up"
      ? "text-rose-600"
      : plan.changeDirection === "down"
        ? "text-emerald-600"
        : "text-muted-foreground";

  return (
    <article className="group flex flex-col gap-4 rounded-3xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-6 shadow-xs transition-all hover:border border-border/60-premium hover:shadow-sm-lg">
      <header className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            {plan.name}
          </h3>
          <div className="mt-2">
            <PremiumBadge variant="outline" className="text-xs font-semibold uppercase">
              {renderModelLabel(plan.evaluationModel)}
            </PremiumBadge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Cena</p>
          <p
            className="text-xl font-semibold text-foreground"
            data-testid={`plan-price-${plan.id}`}
          >
            {formattedPrice}
          </p>
          {showOriginal ? (
            <p className="text-[11px] text-muted-foreground">
              ({formatOriginalCurrency(plan.price, plan.currency)})
            </p>
          ) : null}
        </div>
      </header>

      <PriceSparkline
        history={plan.history}
        targetCurrency={displayCurrency}
      />

      {plan.changeLabel ? (
        <div className={`flex items-center gap-2 rounded-lg border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! px-3 py-2 ${changeBadge === "text-emerald-600" ? "border-emerald-500/20 bg-emerald-500/5" : changeBadge === "text-rose-600" ? "border-rose-500/20 bg-rose-500/5" : "border-border/60"}`}>
          <PremiumIcon icon={LineChart} variant={plan.changeDirection === "flat" ? "default" : "glow"} size="sm" />
          <p className={`text-xs font-medium ${changeBadge}`}>
            {plan.changeLabel}
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-4 shadow-xs sm:grid-cols-2">
        <PlanStat
          label="Max drawdown"
          value={formatMoney(plan.convertedMaxDrawdown, displayCurrency)}
        />
        <PlanStat
          label="Max daily loss"
          value={formatMoney(plan.convertedMaxDailyLoss, displayCurrency)}
        />
        <PlanStat
          label="Profit target"
          value={formatMoney(plan.convertedProfitTarget, displayCurrency)}
        />
        <PlanStat
          label="Min dni handlu"
          value={formatPlainNumber(plan.minTradingDays)}
        />
        <PlanStat
          label="Pierwsza wyplata"
          value={formatDays(plan.payoutFirstAfterDays)}
        />
        <PlanStat
          label="Cykl wyplat"
          value={formatDays(plan.payoutCycleDays)}
        />
        <PlanStat
          label="Dzwignia"
          value={plan.leverage ? `${plan.leverage}x` : "Brak danych"}
        />
        <PlanStat
          label="Refundacja oplaty"
          value={plan.refundableFee ? "Tak" : "Nie"}
        />
      </div>

      {plan.features.length ? (
        <div className="space-y-2 rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-4 shadow-xs text-sm">
          <p className="font-semibold text-foreground">Co wyroznia plan</p>
          <ul className="space-y-1.5 text-muted-foreground">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <PremiumIcon icon={Check} variant="glow" size="sm" className="mt-0.5 text-emerald-600" />
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-2 rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-4 shadow-xs text-sm text-muted-foreground">
        {plan.accountType ? (
          <div className="flex items-center gap-2">
            <span>Typ konta:</span>
            <PremiumBadge variant="outline" className="text-xs font-semibold">
              {plan.accountType}
            </PremiumBadge>
          </div>
        ) : null}
        {plan.cashbackPoints !== null && plan.cashbackPoints > 0 ? (
          <div className="flex items-center gap-2">
            <span>Cashback:</span>
            <PremiumBadge variant="glow" className="text-xs font-semibold text-foreground">
              {plan.cashbackPoints} pkt
            </PremiumBadge>
            {plan.price > 0
              ? <span className="text-xs">(przy {formatOriginalCurrency(plan.price, plan.currency)})</span>
              : null}
          </div>
        ) : (
          <p>Cashback: brak informacji</p>
        )}
      </div>

      {plan.affiliateUrl ? (
        <div className="flex flex-col sm:flex-row sm:justify-end">
          <PurchaseButton
            companySlug={companySlug}
            href={plan.affiliateUrl}
            planId={plan.id}
          >
            Kup plan {plan.name}
            <PremiumIcon icon={ExternalLink} variant="glow" size="sm" className="ml-2" />
          </PurchaseButton>
        </div>
      ) : null}
    </article>
  );
}

function PlanComparisonTable({
  plans,
  currency,
}: {
  plans: PlanWithComputed[];
  currency: SupportedCurrency;
}) {
  if (plans.length < 2) {
    return (
      <div className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-6 text-sm text-muted-foreground shadow-xs">
        Dodaj wiecej planow, aby zobaczyc porownanie.
      </div>
    );
  }

  const rows: {
    label: string;
    render: (plan: PlanWithComputed) => string;
  }[] = [
    {
      label: "Cena",
      render: (plan) =>
        formatCurrencyLocalized(plan.convertedPrice, currency),
    },
    {
      label: "Max drawdown",
      render: (plan) =>
        formatMoney(plan.convertedMaxDrawdown, currency),
    },
    {
      label: "Max daily loss",
      render: (plan) =>
        formatMoney(plan.convertedMaxDailyLoss, currency),
    },
    {
      label: "Profit target",
      render: (plan) =>
        formatMoney(plan.convertedProfitTarget, currency),
    },
    {
      label: "Min dni handlu",
      render: (plan) => formatPlainNumber(plan.minTradingDays),
    },
    {
      label: "Dzwignia",
      render: (plan) => (plan.leverage ? `${plan.leverage}x` : "Brak"),
    },
    {
      label: "Refundacja oplaty",
      render: (plan) => (plan.refundableFee ? "Tak" : "Nie"),
    },
    {
      label: "Scaling",
      render: (plan) => (plan.scalingPlan ? "Tak" : "Brak"),
    },
    {
      label: "Cashback (pkt)",
      render: (plan) =>
        plan.cashbackPoints !== null ? `${plan.cashbackPoints}` : "Brak",
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead>
          <tr className="border-b border border-border/60 bg-muted/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Parametr</th>
            {plans.map((plan) => (
              <th key={plan.id} className="px-4 py-3 font-semibold">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, index) => (
            <tr key={row.label} className={index % 2 === 0 ? "bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]!" : "bg-muted/20"}>
              <td className="px-4 py-3 font-medium text-foreground">
                {row.label}
              </td>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-muted-foreground">
                  {row.render(plan)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriceSparkline({
  history,
  targetCurrency,
}: {
  history: PriceHistoryPoint[];
  targetCurrency: SupportedCurrency;
}) {
  const { rates } = useCurrency();
  if (!history.length) {
    return null;
  }

  const values = history.map((point) =>
    convertCurrency(point.price, point.currency, targetCurrency, rates),
  );
  if (values.length < 2) {
    return null;
  }

  const width = 220;
  const height = 60;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x =
        values.length === 1
          ? width / 2
          : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="80"
      role="presentation"
      className="text-muted-foreground"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        points={points}
        className="text-foreground/70"
      />
    </svg>
  );
}

function computeChange(
  history: PriceHistoryPoint[],
  targetCurrency: SupportedCurrency,
  rates: CurrencyRates,
) {
  if (!history.length) {
    return { percent: null, label: null, direction: "flat" as const };
  }
  const values = history.map((point) =>
    convertCurrency(point.price, point.currency, targetCurrency, rates),
  );
  if (values.length < 2) {
    return { percent: null, label: null, direction: "flat" as const };
  }
  const first = values[0];
  const last = values[values.length - 1];
  if (!first) {
    return { percent: null, label: null, direction: "flat" as const };
  }
  const diff = last - first;
  const percent = first === 0 ? null : (diff / first) * 100;
  const direction: "up" | "down" | "flat" =
    percent === null
      ? "flat"
      : percent > 0.5
        ? "up"
        : percent < -0.5
          ? "down"
          : "flat";

  if (percent === null) {
    return { percent, label: null, direction };
  }

  const earliest = history[0];
  const latest = history[history.length - 1];
  const days = earliest && latest
    ? Math.max(
        1,
        Math.round(
          (new Date(latest.recordedAt).getTime() -
            new Date(earliest.recordedAt).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const label =
    percent > 0
      ? `Cena rosnie o ${percent.toFixed(1)}% w ostatnich ${days ?? "kilku"} dniach`
      : percent < 0
        ? `Cena spada o ${Math.abs(percent).toFixed(1)}%`
        : null;

  return { percent, label, direction };
}

function formatOriginalCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("pl-PL")} ${currency}`;
  }
}

function formatMoney(
  value: number | null,
  currency: SupportedCurrency,
): string {
  if (value === null || Number.isNaN(value)) {
    return "Brak danych";
  }
  return formatCurrencyLocalized(value, currency);
}

function formatPlainNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Brak";
  }
  return value.toString();
}

function formatDays(value: number | null | undefined) {
  if (!value) {
    return "Brak danych";
  }
  if (value === 0) {
    return "Natychmiast";
  }
  return `${value} dni`;
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

function PlanStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
