"use client";

import { MetricCard } from "./metric-card";
import { SectionCard } from "./section-card";
import type { CashbackStats } from "@/lib/queries/cashback-stats";
import {
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  BarChart3,
  Zap,
} from "lucide-react";

interface CashbackStatisticsOverviewProps {
  stats: CashbackStats;
}

export function CashbackStatisticsOverview({ stats }: CashbackStatisticsOverviewProps) {
  return (
    <div className="flex flex-col fluid-stack-md">
      {/* Główne metryki */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Zgłoszenia afiliacyjne"
          value={stats.pendingAffiliateCount}
          description="Oczekujące na decyzję"
          icon={AlertCircle}
          variant="warning"
        />
        <MetricCard
          title="Wnioski o wypłatę"
          value={stats.pendingRedeemCount}
          description="Status: oczekujące"
          icon={DollarSign}
          variant="warning"
        />
        <MetricCard
          title="Wszystkie oczekujące"
          value={stats.allPendingCount}
          description="Operacje wymagające akcji"
          icon={Package}
          variant="primary"
        />
        <MetricCard
          title="W kolejce"
          value={stats.totalInQueue}
          description="Wszystkie operacje w kolejce"
          icon={BarChart3}
          variant="default"
        />
      </div>

      {/* Metryki finansowe */}
      <SectionCard title="Metryki finansowe" description="Szczegółowe informacje o punktach i transakcjach">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Suma punktów w kolejce"
            value={stats.totalPointsInQueue.toLocaleString("pl-PL")}
            description="Punkty oczekujące na przetworzenie"
            icon={Zap}
            variant="default"
          />
          <MetricCard
            title="Średnia wartość transakcji"
            value={stats.averageTransactionValue.toLocaleString("pl-PL", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            description="Punkty na transakcję"
            icon={BarChart3}
            variant="default"
          />
          <MetricCard
            title="Wskaźnik zatwierdzeń"
            value={`${stats.approvalRate.toLocaleString("pl-PL", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}%`}
            description="Zatwierdzone / Przetworzone"
            icon={TrendingUp}
            variant="success"
          />
          <MetricCard
            title="Wskaźnik odrzuceń"
            value={`${stats.rejectionRate.toLocaleString("pl-PL", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}%`}
            description="Odrzucone / Przetworzone"
            icon={TrendingDown}
            variant="danger"
          />
        </div>
      </SectionCard>

      {/* Trendy */}
      <SectionCard title="Trendy czasowe" description="Aktywność w ostatnich dniach">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Transakcje (7 dni)"
            value={stats.transactionsLast7Days}
            description="Nowe transakcje w ostatnim tygodniu"
            icon={Clock}
            variant="default"
          />
          <MetricCard
            title="Transakcje (30 dni)"
            value={stats.transactionsLast30Days}
            description="Nowe transakcje w ostatnim miesiącu"
            icon={Clock}
            variant="default"
          />
          <MetricCard
            title="Punkty (7 dni)"
            value={stats.pointsLast7Days.toLocaleString("pl-PL")}
            description="Przyznane punkty w ostatnim tygodniu"
            icon={Zap}
            variant="default"
          />
          <MetricCard
            title="Punkty (30 dni)"
            value={stats.pointsLast30Days.toLocaleString("pl-PL")}
            description="Przyznane punkty w ostatnim miesiącu"
            icon={Zap}
            variant="default"
          />
        </div>
      </SectionCard>
    </div>
  );
}



