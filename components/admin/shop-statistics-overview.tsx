"use client";

import { MetricCard } from "./metric-card";
import { SectionCard } from "./section-card";
import type { ShopRevenueStats } from "@/lib/queries/shop";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Target,
  BarChart3,
  Percent,
  Clock,
  Users,
  Zap,
} from "lucide-react";

interface ShopStatisticsOverviewProps {
  stats: ShopRevenueStats;
}

export function ShopStatisticsOverview({ stats }: ShopStatisticsOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Główne metryki */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Revenue"
          value={`$${stats.revenue.toLocaleString("pl-PL", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          description="Łączny przychód ze wszystkich zamówień"
          icon={DollarSign}
          variant="primary"
        />
        <MetricCard
          title="Zarobek"
          value={`$${stats.profit.toLocaleString("pl-PL", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          description="Revenue - Koszty - Prowizja"
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Zamówienia"
          value={stats.totalOrders}
          description={`${stats.approvedOrders} zatwierdzone, ${stats.pendingOrders} oczekujące`}
          icon={Package}
          variant="default"
        />
        <MetricCard
          title="ROI"
          value={`${stats.roi.toLocaleString("pl-PL", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}%`}
          description="(Zarobek / Koszty) × 100"
          icon={Percent}
          variant="primary"
        />
      </div>

      {/* Finanse */}
      <SectionCard
        title="Finanse"
        description="Szczegółowe informacje finansowe"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Koszty cashbacku"
            value={`${stats.costs.toLocaleString("pl-PL")} pkt`}
            description={`$${stats.costs.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={TrendingDown}
            variant="default"
          />
          <MetricCard
            title="Marża zysku"
            value={`${stats.profitMargin.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}%`}
            description="(Zarobek / Revenue) × 100"
            icon={Percent}
            variant="success"
          />
          <MetricCard
            title="Wskaźnik cashbacku"
            value={`${stats.cashbackRate.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}%`}
            description="(Koszty / Revenue) × 100"
            icon={Percent}
            variant="default"
          />
        </div>
      </SectionCard>

      {/* Performance */}
      <SectionCard
        title="Wydajność"
        description="Metryki wydajności i konwersji"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Conversion Rate"
            value={`${stats.conversionRate.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}%`}
            description="Zamówienia / Kliknięcia"
            icon={Target}
            variant="primary"
          />
          <MetricCard
            title="Średnia wartość (AOV)"
            value={`$${stats.averageOrderValue.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description="Revenue / Zatwierdzone zamówienia"
            icon={BarChart3}
            variant="default"
          />
          <MetricCard
            title="Wskaźnik zatwierdzeń"
            value={`${stats.approvalRate.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}%`}
            description="Zatwierdzone / Wszystkie zamówienia"
            icon={TrendingUp}
            variant="success"
          />
          <MetricCard
            title="Wskaźnik odrzuceń"
            value={`${stats.rejectionRate.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}%`}
            description="Odrzucone / Wszystkie zamówienia"
            icon={TrendingDown}
            variant="danger"
          />
        </div>
      </SectionCard>

      {/* Wartości średnie i użytkownicy */}
      <SectionCard
        title="Wartości średnie i aktywność"
        description="Średnie wartości na zamówienie i aktywność użytkowników"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Średni cashback na zamówienie"
            value={`$${stats.averageCashbackPerOrder.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description="Koszty / Zatwierdzone zamówienia"
            icon={Zap}
            variant="default"
          />
          <MetricCard
            title="Średnia prowizja na zamówienie"
            value={`$${stats.averageCommissionPerOrder.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description="Prowizja łączna / Zatwierdzone zamówienia"
            icon={Percent}
            variant="default"
          />
          <MetricCard
            title="Aktywni użytkownicy"
            value={stats.activeUsers}
            description="Unikalni użytkownicy z zamówieniami"
            icon={Users}
            variant="default"
          />
          <MetricCard
            title="Revenue per Click (RPC)"
            value={`$${stats.revenuePerClick.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description="Revenue / Wszystkie kliknięcia"
            icon={DollarSign}
            variant="default"
          />
        </div>
      </SectionCard>

      {/* Dodatkowe metryki */}
      <SectionCard
        title="Dodatkowe metryki"
        description="Wskaźniki i czas zatwierdzenia"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Średni czas zatwierdzenia"
            value={`${stats.averageTimeToApproval.toLocaleString("pl-PL", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}h`}
            description="Średni czas od utworzenia do zatwierdzenia"
            icon={Clock}
            variant="default"
          />
          <MetricCard
            title="Wskaźnik prowizji"
            value={`${stats.commissionRate.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}%`}
            description="(Prowizja / Revenue) × 100"
            icon={Percent}
            variant="default"
          />
        </div>
      </SectionCard>
    </div>
  );
}


