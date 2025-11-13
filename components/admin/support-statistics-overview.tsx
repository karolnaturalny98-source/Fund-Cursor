"use client";

import { MetricCard } from "./metric-card";
import { SectionCard } from "./section-card";
import type { SupportStats } from "@/lib/queries/support-stats";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  FileWarning,
  Search,
} from "lucide-react";

interface SupportStatisticsOverviewProps {
  stats: SupportStats;
}

export function SupportStatisticsOverview({ stats }: SupportStatisticsOverviewProps) {
  return (
    <div className="flex flex-col fluid-stack-md">
      <SectionCard
        title="Przegląd statusów sporów"
        description="Kluczowe metryki dotyczące zgłoszeń i sporów użytkowników."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MetricCard
            title="Otwarte spory"
            value={stats.openDisputes}
            description="Wymagają akcji"
            icon={FileWarning}
            variant="warning"
          />
          <MetricCard
            title="W trakcie analizy"
            value={stats.inReviewDisputes}
            description="Sprawdzane przez admina"
            icon={Search}
            variant="warning"
          />
          <MetricCard
            title="Czekamy na użytkownika"
            value={stats.waitingUserDisputes}
            description="Oczekiwanie na odpowiedź"
            icon={Clock}
            variant="warning"
          />
          <MetricCard
            title="Zamknięte"
            value={stats.resolvedDisputes}
            description="Rozwiązane pomyślnie"
            icon={CheckCircle}
            variant="success"
          />
          <MetricCard
            title="Odrzucone"
            value={stats.rejectedDisputes}
            description="Odrzucone spory"
            icon={XCircle}
            variant="danger"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Trendy i aktywność"
        description="Zmiany w liczbie sporów w ostatnich 30 dniach."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Nowe spory (30 dni)"
            value={stats.disputesLast30Days}
            description="Zgłoszenia w ostatnim miesiącu"
            icon={TrendingUp}
            variant="default"
          />
          <MetricCard
            title="Średni czas rozwiązania"
            value={`${stats.averageResolutionTime.toFixed(1)} dni`}
            description="Średnia liczba dni do zamknięcia"
            icon={Clock}
            variant="default"
          />
          <MetricCard
            title="Łączna kwota żądań"
            value={`${stats.totalRequestedAmount.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} PLN`}
            description="Suma wszystkich żądanych kwot"
            icon={DollarSign}
            variant="default"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Podsumowanie"
        description="Całkowita liczba sporów w systemie."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Całkowita liczba sporów"
            value={stats.totalDisputes}
            description="Wszystkie zgłoszenia w systemie"
            icon={AlertCircle}
            variant="primary"
          />
          <MetricCard
            title="Aktywne spory"
            value={stats.openDisputes + stats.inReviewDisputes + stats.waitingUserDisputes}
            description="Spory wymagające akcji"
            icon={FileWarning}
            variant="warning"
          />
          <MetricCard
            title="Zamknięte spory"
            value={stats.resolvedDisputes + stats.rejectedDisputes}
            description="Rozwiązane lub odrzucone"
            icon={CheckCircle}
            variant="success"
          />
        </div>
      </SectionCard>
    </div>
  );
}


