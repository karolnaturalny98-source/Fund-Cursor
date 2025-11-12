"use client";

import { Clock, TrendingUp, Award, Layers } from "lucide-react";
import { MetricCard } from "@/components/admin/metric-card";
import { useFadeIn } from "@/lib/animations";
import type { CompanyWithDetails } from "@/lib/types";

interface PayoutsQuickStatsProps {
  company: CompanyWithDetails;
}

export function PayoutsQuickStats({ company }: PayoutsQuickStatsProps) {
  const sectionAnim = useFadeIn({ rootMargin: "-50px" });

  // Calculate fastest first payout
  const fastestFirstPayout = company.plans.reduce((fastest, plan) => {
    if (!plan.payoutFirstAfterDays) return fastest;
    if (!fastest || !fastest.payoutFirstAfterDays) return plan;
    return plan.payoutFirstAfterDays < fastest.payoutFirstAfterDays ? plan : fastest;
  }, company.plans[0] ?? null);

  // Calculate average cycle
  const cycles = company.plans
    .map((plan) => plan.payoutCycleDays)
    .filter((days): days is number => days !== null && days !== undefined);
  const averageCycle = cycles.length > 0
    ? Math.round(cycles.reduce((sum, days) => sum + days, 0) / cycles.length)
    : null;

  // Find best profit split
  const bestProfitSplit = company.plans.reduce((best, plan) => {
    if (!plan.profitSplit) return best;
    const match = /^(\d{1,3})/.exec(plan.profitSplit);
    if (!match) return best;
    const value = parseInt(match[1], 10);
    if (!best || !best.profitSplit) return plan;
    const bestMatch = /^(\d{1,3})/.exec(best.profitSplit);
    if (!bestMatch) return plan;
    const bestValue = parseInt(bestMatch[1], 10);
    return value > bestValue ? plan : best;
  }, company.plans[0] ?? null);

  const formatDays = (days: number | null | undefined): string => {
    if (!days) return "Brak danych";
    if (days === 1) return "1 dzień";
    if (days < 7) return `${days} dni`;
    if (days === 7) return "1 tydzień";
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      if (remainingDays === 0) return `${weeks} ${weeks === 1 ? "tydzień" : "tygodni"}`;
      return `${weeks} ${weeks === 1 ? "tydzień" : "tygodni"} ${remainingDays} ${remainingDays === 1 ? "dzień" : "dni"}`;
    }
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) return `${months} ${months === 1 ? "miesiąc" : "miesięcy"}`;
    return `${months} ${months === 1 ? "miesiąc" : "miesięcy"} ${remainingDays} ${remainingDays === 1 ? "dzień" : "dni"}`;
  };

  const stats = [
    {
      title: "Najszybsza pierwsza wypłata",
      value: fastestFirstPayout?.payoutFirstAfterDays
        ? formatDays(fastestFirstPayout.payoutFirstAfterDays)
        : "Brak danych",
      description: fastestFirstPayout ? `Plan: ${fastestFirstPayout.name}` : undefined,
      icon: Clock,
      variant: "success" as const,
    },
    {
      title: "Średni cykl wypłat",
      value: averageCycle ? `co ${averageCycle} dni` : "Brak danych",
      description: cycles.length > 0 ? `${cycles.length} planów` : undefined,
      icon: TrendingUp,
      variant: "default" as const,
    },
    {
      title: "Najlepszy profit split",
      value: bestProfitSplit?.profitSplit ?? "Brak danych",
      description: bestProfitSplit ? `Plan: ${bestProfitSplit.name}` : undefined,
      icon: Award,
      variant: "primary" as const,
    },
    {
      title: "Liczba planów",
      value: company.plans.length.toString(),
      description: "Dostępne opcje",
      icon: Layers,
      variant: "default" as const,
    },
  ];

  return (
    <section ref={sectionAnim.ref} className={`space-y-3 ${sectionAnim.className}`}>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold sm:text-xl">Kluczowe statystyki</h2>
        <p className="text-xs text-muted-foreground">
          Podsumowanie najważniejszych parametrów wypłat dla wszystkich planów.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <MetricCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            variant={stat.variant}
          />
        ))}
      </div>
    </section>
  );
}

