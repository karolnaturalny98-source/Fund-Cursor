"use client";

import { useMemo } from "react";
import { Package, DollarSign, TrendingDown, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";
import { useCurrency } from "@/app/providers/currency-client-provider";
import { convertCurrency, formatCurrencyLocalized } from "@/lib/currency";
import type { CompanyWithDetails } from "@/lib/types";

interface OffersQuickStatsProps {
  company: CompanyWithDetails;
}

export function OffersQuickStats({ company }: OffersQuickStatsProps) {
  const { currency, rates } = useCurrency();
  const sectionAnim = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(5, 100);
  const visibleStaggerItems = sectionAnim.isVisible ? staggerItems : new Array(5).fill(false);

  const stats = useMemo(() => {
    if (company.plans.length === 0) {
      return [];
    }

    const convertedPrices = company.plans.map((plan) =>
      convertCurrency(plan.price, plan.currency, currency, rates)
    );

    const totalPrice = convertedPrices.reduce((sum, price) => sum + price, 0);
    const averagePrice = totalPrice / convertedPrices.length;
    const minPrice = Math.min(...convertedPrices);
    const maxPrice = Math.max(...convertedPrices);

    const modelCounts = company.plans.reduce(
      (acc, plan) => {
        acc[plan.evaluationModel] = (acc[plan.evaluationModel] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const modelDistribution = Object.entries(modelCounts)
      .map(([model, count]) => {
        let label = "";
        switch (model) {
          case "one-step":
            label = "1-etapowe";
            break;
          case "two-step":
            label = "2-etapowe";
            break;
          case "instant-funding":
            label = "Instant";
            break;
          default:
            label = model;
        }
        return `${label}: ${count}`;
      })
      .join(", ");

    return [
      {
        label: "Dostępne plany",
        value: company.plans.length,
        description: "Liczba aktywnych planów",
        icon: Package,
        color: "text-primary",
        bgColor: "bg-white/10",
      },
      {
        label: "Średnia cena",
        value: formatCurrencyLocalized(averagePrice, currency),
        description: "Średnia cena wszystkich planów",
        icon: DollarSign,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
      },
      {
        label: "Najniższa cena",
        value: formatCurrencyLocalized(minPrice, currency),
        description: "Najtańszy dostępny plan",
        icon: TrendingDown,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      },
      {
        label: "Najwyższa cena",
        value: formatCurrencyLocalized(maxPrice, currency),
        description: "Najdroższy dostępny plan",
        icon: TrendingUp,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
      },
      {
        label: "Rozkład modeli",
        value: modelDistribution || "Brak danych",
        description: "Podział planów po modelach oceny",
        icon: BarChart3,
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
      },
    ];
  }, [company.plans, currency, rates]);

  if (stats.length === 0) {
    return null;
  }

  return (
    <section ref={sectionAnim.ref} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold sm:text-2xl">Statystyki planów</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Przegląd dostępnych planów i ich cen.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <Card
            key={stat.label}
            className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md ${
              visibleStaggerItems[index]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionDelay: visibleStaggerItems[index] ? `${index * 100}ms` : "0ms",
            }}
          >
            <CardHeader className="space-y-2 pb-2">
              <div className="flex items-center gap-2">
                <div className={`rounded-lg ${stat.bgColor} p-1.5 ${stat.color} transition-colors group-hover:opacity-80`}>
                  <PremiumIcon icon={stat.icon} variant="glow" size="sm" hoverGlow />
                </div>
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </div>
              <CardDescription className="text-xs leading-tight">{stat.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl font-semibold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

