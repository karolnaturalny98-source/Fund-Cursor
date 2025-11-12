"use client";

import { MetricCard } from "./metric-card";
import { SectionCard } from "./section-card";
import type { ContentStats } from "@/lib/queries/content-stats";
import {
  Building2,
  FileText,
  HelpCircle,
  TrendingUp,
  BarChart3,
  CheckCircle,
} from "lucide-react";

interface ContentStatisticsOverviewProps {
  stats: ContentStats;
}

export function ContentStatisticsOverview({ stats }: ContentStatisticsOverviewProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Przegląd treści"
        description="Kluczowe metryki dotyczące firm, planów i FAQ."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Całkowita liczba firm"
            value={stats.totalCompanies}
            description="firm w bazie danych"
            icon={Building2}
            variant="primary"
          />
          <MetricCard
            title="Całkowita liczba planów"
            value={stats.totalPlans}
            description="planów kont w systemie"
            icon={FileText}
            variant="primary"
          />
          <MetricCard
            title="Całkowita liczba FAQ"
            value={stats.totalFaqs}
            description="pytań i odpowiedzi"
            icon={HelpCircle}
            variant="primary"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Trendy i aktywność"
        description="Zmiany w aktywności treści w ostatnich 30 dniach."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Nowe firmy (30 dni)"
            value={stats.companiesLast30Days}
            description="firm dodanych w ostatnim miesiącu"
            icon={Building2}
            variant="default"
          />
          <MetricCard
            title="Nowe plany (30 dni)"
            value={stats.plansLast30Days}
            description="planów dodanych w ostatnim miesiącu"
            icon={FileText}
            variant="default"
          />
          <MetricCard
            title="Nowe FAQ (30 dni)"
            value={stats.faqsLast30Days}
            description="pytań dodanych w ostatnim miesiącu"
            icon={HelpCircle}
            variant="default"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Statystyki średnie"
        description="Średnie wartości i pokrycie treści."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Średnio planów na firmę"
            value={stats.averagePlansPerCompany.toFixed(1)}
            description="średnia liczba planów"
            icon={BarChart3}
            variant="default"
          />
          <MetricCard
            title="Średnio FAQ na firmę"
            value={stats.averageFaqsPerCompany.toFixed(1)}
            description="średnia liczba FAQ"
            icon={BarChart3}
            variant="default"
          />
          <MetricCard
            title="Firm z planami"
            value={stats.companiesWithPlans}
            description={`z ${stats.totalCompanies} firm`}
            icon={CheckCircle}
            variant="success"
          />
          <MetricCard
            title="Firm z FAQ"
            value={stats.companiesWithFaqs}
            description={`z ${stats.totalCompanies} firm`}
            icon={CheckCircle}
            variant="success"
          />
        </div>
      </SectionCard>
    </div>
  );
}

