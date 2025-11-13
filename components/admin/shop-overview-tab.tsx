"use client";

import dynamic from "next/dynamic";
import { ShopStatisticsOverview } from "./shop-statistics-overview";
import { ChartSkeleton } from "@/components/analysis/loading-skeleton";

const ShopCharts = dynamic(
  () => import("./shop-charts").then((mod) => ({ default: mod.ShopCharts })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
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
    <div className="flex flex-col fluid-stack-lg">
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



