"use client";

import { ShopStatisticsOverview } from "./shop-statistics-overview";
import { ShopCharts } from "./shop-charts";
import { ShopTimeFilter, type TimePeriod, type TimeRange } from "./shop-time-filter";
import type { ShopRevenueStats, ShopTopCompany, ShopTopPlan } from "@/lib/queries/shop";

interface ShopOverviewTabProps {
  stats: ShopRevenueStats;
  topCompanies: ShopTopCompany[];
  topPlans: ShopTopPlan[];
  selectedPeriod: TimePeriod;
  timeRange: TimeRange | undefined;
  onPeriodChange: (period: TimePeriod, range?: TimeRange) => void;
}

export function ShopOverviewTab({
  stats,
  topCompanies,
  topPlans,
  selectedPeriod,
  timeRange,
  onPeriodChange,
}: ShopOverviewTabProps) {
  return (
    <div className="space-y-8">
      <ShopTimeFilter
        onPeriodChange={onPeriodChange}
        selectedPeriod={selectedPeriod}
        customRange={timeRange}
      />

      <ShopStatisticsOverview stats={stats} />

      <ShopCharts topCompanies={topCompanies} topPlans={topPlans} />
    </div>
  );
}


