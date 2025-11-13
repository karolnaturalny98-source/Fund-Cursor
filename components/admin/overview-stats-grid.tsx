"use client";

import { MetricCard } from "./metric-card";
import type { ShopRevenueStats } from "@/lib/queries/shop";
import type { ClickAnalyticsResult } from "@/lib/queries/analytics";
import {
  TrendingUp,
  Percent,
  Target,
  BarChart3,
} from "lucide-react";

interface OverviewStatsGridProps {
  shopStats: ShopRevenueStats;
  pendingCounts: {
    affiliate: number;
    cashback: number;
    influencers: number;
    reviews: number;
    issues: number;
    disputes: number;
  };
  clickAnalytics: ClickAnalyticsResult;
}

export function OverviewStatsGrid({
  shopStats,
  pendingCounts,
  clickAnalytics: _clickAnalytics,
}: OverviewStatsGridProps) {
  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Metryki wydajności</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Conversion Rate"
            value={`${shopStats.conversionRate.toFixed(2)}%`}
            description="Zamówienia / Kliknięcia"
            icon={Target}
            variant="primary"
          />
          <MetricCard
            title="Średnia wartość (AOV)"
            value={`$${shopStats.averageOrderValue.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description="Revenue / Zatwierdzone zamówienia"
            icon={BarChart3}
            variant="default"
          />
          <MetricCard
            title="Wskaźnik zatwierdzeń"
            value={`${shopStats.approvalRate.toFixed(2)}%`}
            description="Zatwierdzone / Wszystkie zamówienia"
            icon={TrendingUp}
            variant="success"
          />
          <MetricCard
            title="ROI"
            value={`${shopStats.roi.toFixed(2)}%`}
            description="(Zarobek / Koszty) × 100"
            icon={Percent}
            variant="primary"
          />
        </div>
      </div>

      {/* Pending Items */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Oczekujące akcje</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Transakcje afiliacyjne"
            value={pendingCounts.affiliate}
            description="Oczekują na weryfikację"
            variant={pendingCounts.affiliate > 0 ? "warning" : "default"}
          />
          <MetricCard
            title="Wnioski o wypłatę"
            value={pendingCounts.cashback}
            description="Oczekują na realizację"
            variant={pendingCounts.cashback > 0 ? "warning" : "default"}
          />
          <MetricCard
            title="Zgłoszenia influencerów"
            value={pendingCounts.influencers}
            description="Oczekują na weryfikację"
            variant={pendingCounts.influencers > 0 ? "warning" : "default"}
          />
          <MetricCard
            title="Opinie do moderacji"
            value={pendingCounts.reviews}
            description="Oczekują na decyzję"
            variant={pendingCounts.reviews > 0 ? "warning" : "default"}
          />
          <MetricCard
            title="Błędy danych"
            value={pendingCounts.issues}
            description="Oczekują na rozpatrzenie"
            variant={pendingCounts.issues > 0 ? "warning" : "default"}
          />
          <MetricCard
            title="Otwarte spory"
            value={pendingCounts.disputes}
            description="Wymagają uwagi"
            variant={pendingCounts.disputes > 0 ? "danger" : "default"}
          />
        </div>
      </div>
    </div>
  );
}

