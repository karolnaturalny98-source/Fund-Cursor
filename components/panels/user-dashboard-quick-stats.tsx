"use client";

import { Wallet, Clock, CheckCircle2, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { MetricCard } from "@/components/admin/metric-card";
import { useFadeIn } from "@/lib/animations";
import type { CashbackSummary } from "@/lib/types";

interface UserDashboardQuickStatsProps {
  summary: CashbackSummary;
  recentTransactionsCount?: number;
}

export function UserDashboardQuickStats({
  summary,
  recentTransactionsCount = 0,
}: UserDashboardQuickStatsProps) {
  const sectionAnim = useFadeIn({ rootMargin: "-50px" });

  const totalValue = summary.available + summary.approved;
  const totalPoints = summary.available + summary.pending + summary.approved + summary.redeemed;
  const averageTransaction = recentTransactionsCount > 0 
    ? Math.round(totalPoints / recentTransactionsCount)
    : 0;

  const stats = [
    {
      title: "Dostępne punkty",
      value: summary.available.toLocaleString("pl-PL"),
      description: "Gotowe do wymiany",
      icon: Wallet,
      variant: "success" as const,
    },
    {
      title: "Oczekujące punkty",
      value: summary.pending.toLocaleString("pl-PL"),
      description: "W trakcie weryfikacji",
      icon: Clock,
      variant: "warning" as const,
    },
    {
      title: "Zatwierdzone punkty",
      value: summary.approved.toLocaleString("pl-PL"),
      description: "Zatwierdzone do wymiany",
      icon: CheckCircle2,
      variant: "primary" as const,
    },
    {
      title: "Zrealizowane punkty",
      value: summary.redeemed.toLocaleString("pl-PL"),
      description: "Już wykorzystane",
      icon: TrendingUp,
      variant: "default" as const,
    },
    {
      title: "Łączna wartość",
      value: `${totalValue.toLocaleString("pl-PL")} pkt`,
      description: "Dostępne + zatwierdzone",
      icon: DollarSign,
      variant: "primary" as const,
    },
    {
      title: "Średnia transakcja",
      value: averageTransaction > 0 ? `${averageTransaction.toLocaleString("pl-PL")} pkt` : "Brak danych",
      description: recentTransactionsCount > 0 ? `${recentTransactionsCount} transakcji` : "Brak transakcji",
      icon: BarChart3,
      variant: "default" as const,
    },
  ];

  return (
    <section
      ref={sectionAnim.ref}
      className={`space-y-[clamp(1rem,1.8vw,1.6rem)] ${sectionAnim.className}`}
    >
      <div className="space-y-[clamp(0.35rem,0.55vw,0.5rem)]">
        <h2 className="fluid-h2 font-semibold text-foreground">Kluczowe metryki</h2>
        <p className="fluid-caption text-muted-foreground">
          Szybki przegląd Twoich punktów cashback.
        </p>
      </div>
      <div className="grid gap-[clamp(0.85rem,1.2vw,1.1rem)] sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, _index) => (
          <MetricCard
            key={stat.title}
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

