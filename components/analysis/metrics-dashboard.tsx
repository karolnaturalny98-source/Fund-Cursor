"use client";

import { TrendingUp, Star, FileText, DollarSign, Calendar, Shield, CreditCard, BarChart3, Trophy, Layers, Settings } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { CompanyWithDetails } from "@/lib/types";
import type { ComparisonMetrics } from "@/lib/queries/analysis";
import { cn } from "@/lib/utils";
import { useStaggerAnimation } from "@/lib/animations";

interface MetricsDashboardProps {
  companies: CompanyWithDetails[];
  comparisonMetrics: Record<string, ComparisonMetrics>;
}

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  values: { companyName: string; value: string | number; companyId: string }[];
  unit?: string;
  higherIsBetter?: boolean;
}

function MetricCard({ title, icon, values, unit = "", higherIsBetter = true }: MetricCardProps) {
  if (values.length === 0) {
    return null;
  }

  // Find best and worst values for comparison
  const numericValues = values
    .map((v) => ({
      ...v,
      numValue: typeof v.value === "number" ? v.value : parseFloat(String(v.value)) || 0,
    }))
    .filter((v) => !isNaN(v.numValue));

  if (numericValues.length === 0) {
    return null;
  }

  const bestValue = higherIsBetter
    ? Math.max(...numericValues.map((v) => v.numValue))
    : Math.min(...numericValues.map((v) => v.numValue));
  
  const worstValue = higherIsBetter
    ? Math.min(...numericValues.map((v) => v.numValue))
    : Math.max(...numericValues.map((v) => v.numValue));
  
  const range = bestValue - worstValue;

  return (
    <Card className="group relative overflow-hidden glass-card transition-all duration-300 hover:border-primary/45 hover:shadow-premium before:absolute before:inset-y-4 before:left-0 before:w-[3px] before:rounded-full before:bg-primary/20 group-hover:before:bg-primary/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[clamp(0.75rem,1.1vw,1rem)]">
        <CardTitle className="text-[clamp(0.95rem,0.4vw+0.85rem,1.05rem)] font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          {title}
        </CardTitle>
        <div className="rounded-full bg-primary/10 p-[clamp(0.55rem,0.8vw,0.7rem)] text-primary transition-colors group-hover:bg-primary/20">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-[clamp(0.75rem,1.1vw,1rem)]">
        {values.map((item) => {
          const numValue =
            typeof item.value === "number"
              ? item.value
              : parseFloat(String(item.value)) || 0;
          const isBest = numValue === bestValue && numericValues.length > 1;
          
          // Calculate progress percentage for visual indicator
          const progress = range !== 0 
            ? higherIsBetter
              ? ((numValue - worstValue) / range) * 100
              : ((bestValue - numValue) / (bestValue - worstValue)) * 100
            : 100;

          return (
            <div key={item.companyId} className="space-y-[clamp(0.45rem,0.7vw,0.65rem)]">
              <div className="flex items-center justify-between gap-[clamp(0.75rem,1.1vw,1rem)] rounded-xl border border-transparent p-[clamp(0.7rem,1vw,0.9rem)] transition-all duration-200 hover:border-primary/30 hover:bg-muted/30">
                <span className="min-w-0 flex-1 pr-2 text-muted-foreground fluid-caption font-medium">
                  <span className="block truncate">{item.companyName}</span>
                </span>
                <div className="flex shrink-0 items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                  <span
                    className={cn(
                      "font-bold tabular-nums text-[clamp(1.05rem,0.5vw+0.95rem,1.3rem)]",
                      isBest ? "text-primary" : "text-foreground"
                    )}
                  >
                    {typeof item.value === "number"
                      ? item.value.toFixed(item.value % 1 === 0 ? 0 : 2)
                      : item.value}
                  </span>
                  {unit && (
                    <span
                      className={cn(
                        "text-muted-foreground fluid-caption font-medium",
                        isBest ? "text-primary/70" : "text-muted-foreground",
                      )}
                    >
                      {unit}
                    </span>
                  )}
                  {isBest && (
                    <Badge 
                      variant="default" 
                      className="bg-primary/90 text-primary-foreground flex items-center gap-[clamp(0.3rem,0.4vw,0.4rem)] fluid-badge"
                    >
                      <Trophy className="h-[clamp(0.75rem,0.35vw+0.65rem,0.85rem)] w-[clamp(0.75rem,0.35vw+0.65rem,0.85rem)]" />
                      TOP
                    </Badge>
                  )}
                </div>
              </div>
              {/* Progress bar indicator */}
              {numericValues.length > 1 && (
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 w-[var(--progress-width)]",
                      isBest 
                        ? "bg-primary" 
                        : "bg-primary/30"
                    )}
                    style={{ "--progress-width": `${Math.max(5, Math.min(100, progress))}%` } as React.CSSProperties}
                  />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function MetricsDashboard({ companies, comparisonMetrics }: MetricsDashboardProps) {
  // Prepare metrics data
  const avgPlanPrices = companies.map((company) => ({
    companyName: company.name,
    companyId: company.id,
    value: comparisonMetrics[company.id]?.avgPlanPrice || 0,
  }));

  const cashbackRates = companies.map((company) => ({
    companyName: company.name,
    companyId: company.id,
    value: company.cashbackRate || 0,
  }));

  const ratings = companies.map((company) => ({
    companyName: company.name,
    companyId: company.id,
    value: company.rating || 0,
  }));

  const totalPlans = companies.map((company) => ({
    companyName: company.name,
    companyId: company.id,
    value: comparisonMetrics[company.id]?.totalPlans || 0,
  }));

  const foundedYears = companies
    .filter((c) => c.foundedYear)
    .map((company) => ({
      companyName: company.name,
      companyId: company.id,
      value: company.foundedYear!,
    }));

  const paymentMethodsCounts = companies.map((company) => ({
    companyName: company.name,
    companyId: company.id,
    value: company.paymentMethods.length,
  }));

  const instrumentsCounts = companies.map((company) => ({
    companyName: company.name,
    companyId: company.id,
    value: company.instruments.length,
  }));

  const avgProfitSplits = companies
    .map((company) => ({
      companyName: company.name,
      companyId: company.id,
      value: comparisonMetrics[company.id]?.avgProfitSplit || 0,
    }))
    .filter((item) => item.value > 0);

  const avgLeverages = companies
    .map((company) => ({
      companyName: company.name,
      companyId: company.id,
      value: comparisonMetrics[company.id]?.avgLeverage || 0,
    }))
    .filter((item) => item.value > 0);

  // Najważniejsze metryki - zawsze widoczne
  const primaryMetrics = [
    { title: "Ocena", icon: <Star className="h-4 w-4" />, values: ratings, unit: "", higherIsBetter: true },
    { title: "Stawka cashback", icon: <TrendingUp className="h-4 w-4" />, values: cashbackRates, unit: "%", higherIsBetter: true },
    { title: "Średnia cena planu", icon: <DollarSign className="h-4 w-4" />, values: avgPlanPrices, unit: " USD", higherIsBetter: false },
    { title: "Liczba planów", icon: <FileText className="h-4 w-4" />, values: totalPlans, unit: "", higherIsBetter: true },
  ];

  // Metryki do sekcji zwijanych
  const pricingMetrics = [
    ...(avgProfitSplits.length > 0 ? [{ title: "Średni podział zysku", icon: <DollarSign className="h-4 w-4" />, values: avgProfitSplits, unit: "%", higherIsBetter: true }] : []),
    ...(avgLeverages.length > 0 ? [{ title: "Średnia dźwignia", icon: <TrendingUp className="h-4 w-4" />, values: avgLeverages, unit: ":1", higherIsBetter: true }] : []),
  ];

  const featuresMetrics = [
    { title: "Metody płatności", icon: <CreditCard className="h-4 w-4" />, values: paymentMethodsCounts, unit: "", higherIsBetter: true },
    { title: "Dostępne instrumenty", icon: <Layers className="h-4 w-4" />, values: instrumentsCounts, unit: "", higherIsBetter: true },
    ...(foundedYears.length > 0 ? [{ title: "Rok założenia", icon: <Calendar className="h-4 w-4" />, values: foundedYears, unit: "", higherIsBetter: false }] : []),
  ];

  // Animate primary cards with stagger effect
  const visiblePrimaryCards = useStaggerAnimation(primaryMetrics.length, 50);

  return (
    <div className="space-y-[clamp(1.75rem,2.6vw,2.5rem)]">
      <div className="space-y-[clamp(0.9rem,1.3vw,1.2rem)]">
        <div className="inline-flex items-center gap-[clamp(0.55rem,0.8vw,0.7rem)] rounded-full border border-primary/20 bg-primary/5 px-[clamp(1rem,1.4vw,1.3rem)] py-[clamp(0.5rem,0.75vw,0.65rem)]">
          <BarChart3 className="h-[clamp(1.05rem,0.45vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.45vw+0.95rem,1.2rem)] text-primary" />
          <span className="text-[clamp(0.95rem,0.4vw+0.85rem,1.05rem)] font-medium text-primary">Analiza Wskaźników</span>
        </div>
        <h2 className="fluid-h2 font-bold tracking-tight">Kluczowe Metryki</h2>
        <p className="fluid-copy text-muted-foreground max-w-2xl">
          Porównanie najważniejszych wskaźników dla wybranych firm. Wartości oznaczone jako <strong className="text-foreground">TOP</strong> reprezentują najlepsze wyniki w danej kategorii.
        </p>
      </div>

      {/* Najważniejsze metryki - zawsze widoczne */}
      <div className="grid grid-cols-1 gap-[clamp(1.25rem,1.8vw,1.75rem)] md:grid-cols-2 lg:grid-cols-4">
        {primaryMetrics.map((metric, index) => (
          <div 
            key={`primary-${metric.title}-${index}`}
            className={cn(
              "transition-all duration-500",
              visiblePrimaryCards[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <MetricCard
              title={metric.title}
              icon={metric.icon}
              values={metric.values}
              unit={metric.unit}
              higherIsBetter={metric.higherIsBetter}
            />
          </div>
        ))}
      </div>

      {/* Sekcje zwijane z dodatkowymi metrykami */}
      {(pricingMetrics.length > 0 || featuresMetrics.length > 0) && (
        <Accordion type="multiple" className="space-y-[clamp(1rem,1.5vw,1.4rem)]">
          {pricingMetrics.length > 0 && (
            <AccordionItem value="pricing" className="glass-panel px-[clamp(1rem,1.4vw,1.3rem)]">
              <AccordionTrigger className="py-[clamp(0.9rem,1.3vw,1.2rem)] hover:no-underline">
                <div className="flex items-center gap-[clamp(0.75rem,1.1vw,1rem)]">
                  <div className="rounded-lg bg-primary/10 p-[clamp(0.6rem,0.9vw,0.75rem)]">
                    <DollarSign className="h-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)] w-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)] text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[clamp(1rem,0.5vw+0.9rem,1.2rem)] font-semibold">Ceny i warunki</h3>
                    <p className="mt-[clamp(0.3rem,0.5vw,0.45rem)] text-muted-foreground fluid-caption">
                      Szczegółowe informacje o cenach i warunkach handlowych
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-[clamp(0.5rem,0.8vw,0.7rem)] pb-[clamp(1.5rem,2vw,1.9rem)]">
                <div className="grid grid-cols-1 gap-[clamp(1.1rem,1.6vw,1.5rem)] md:grid-cols-2">
                  {pricingMetrics.map((metric, index) => (
                    <MetricCard
                      key={`pricing-${metric.title}-${index}`}
                      title={metric.title}
                      icon={metric.icon}
                      values={metric.values}
                      unit={metric.unit}
                      higherIsBetter={metric.higherIsBetter}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {featuresMetrics.length > 0 && (
            <AccordionItem value="features" className="glass-panel px-[clamp(1rem,1.4vw,1.3rem)]">
              <AccordionTrigger className="py-[clamp(0.9rem,1.3vw,1.2rem)] hover:no-underline">
                <div className="flex items-center gap-[clamp(0.75rem,1.1vw,1rem)]">
                  <div className="rounded-lg bg-primary/10 p-[clamp(0.6rem,0.9vw,0.75rem)]">
                    <Settings className="h-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)] w-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)] text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[clamp(1rem,0.5vw+0.9rem,1.2rem)] font-semibold">Funkcje i dostępność</h3>
                    <p className="mt-[clamp(0.3rem,0.5vw,0.45rem)] text-muted-foreground fluid-caption">
                      Metody płatności, instrumenty i inne funkcje
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-[clamp(0.5rem,0.8vw,0.7rem)] pb-[clamp(1.5rem,2vw,1.9rem)]">
                <div className="grid grid-cols-1 gap-[clamp(1.1rem,1.6vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3">
                  {featuresMetrics.map((metric, index) => (
                    <MetricCard
                      key={`features-${metric.title}-${index}`}
                      title={metric.title}
                      icon={metric.icon}
                      values={metric.values}
                      unit={metric.unit}
                      higherIsBetter={metric.higherIsBetter}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}

      {/* Regulation & Status Cards */}
      <div className="space-y-[clamp(0.9rem,1.3vw,1.2rem)]">
        <h3 className="text-[clamp(1.25rem,0.5vw+1.1rem,1.5rem)] font-semibold">Informacje Regulacyjne</h3>
        <div className="grid gap-[clamp(1.1rem,1.6vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="group relative overflow-hidden glass-panel transition-all duration-300 hover:border-primary/45 hover:shadow-premium before:absolute before:inset-y-5 before:left-0 before:w-[3px] before:rounded-full before:bg-primary/20 group-hover:before:bg-primary/50"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-[clamp(0.55rem,0.8vw,0.7rem)] text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)]">
                  <Shield className="h-[clamp(1rem,0.4vw+0.9rem,1.1rem)] w-[clamp(1rem,0.4vw+0.9rem,1.1rem)] text-primary" />
                  {company.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-[clamp(0.75rem,1.2vw,1.1rem)]">
                {company.regulation && (
                  <div className="rounded-lg bg-muted/50 p-[clamp(0.7rem,1vw,0.9rem)]">
                    <p className="mb-[clamp(0.3rem,0.5vw,0.45rem)] text-muted-foreground fluid-caption font-medium">Regulacja</p>
                    <p className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold text-foreground">
                      {company.regulation}
                    </p>
                  </div>
                )}
                
                {company.country && (
                  <div className="rounded-lg bg-muted/50 p-[clamp(0.7rem,1vw,0.9rem)]">
                    <p className="mb-[clamp(0.3rem,0.5vw,0.45rem)] text-muted-foreground fluid-caption font-medium">Kraj</p>
                    <p className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold text-foreground">{company.country}</p>
                  </div>
                )}

                {company.licenses.length > 0 && (
                  <div>
                    <p className="mb-[clamp(0.4rem,0.6vw,0.55rem)] text-muted-foreground fluid-caption font-medium">Licencje</p>
                    <div className="flex flex-wrap gap-[clamp(0.4rem,0.6vw,0.55rem)]">
                      {company.licenses.map((license, idx) => (
                        <Badge key={idx} variant="outline" className="fluid-badge font-medium">
                          {license}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

