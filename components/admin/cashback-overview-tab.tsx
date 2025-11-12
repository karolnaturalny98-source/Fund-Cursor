"use client";

import { CashbackStatisticsOverview } from "./cashback-statistics-overview";
import { CashbackCharts } from "./cashback-charts";
import type { CashbackStats } from "@/lib/queries/cashback-stats";
import type {
  TransactionTimeSeriesPoint,
  StatusDistribution,
  TopCompany,
} from "@/lib/queries/cashback-stats";

interface CashbackOverviewTabProps {
  stats: CashbackStats;
  timeSeries: TransactionTimeSeriesPoint[];
  statusDistribution: StatusDistribution[];
  topCompanies: TopCompany[];
}

export function CashbackOverviewTab({
  stats,
  timeSeries,
  statusDistribution,
  topCompanies,
}: CashbackOverviewTabProps) {
  return (
    <div className="space-y-6">
      <CashbackStatisticsOverview stats={stats} />
      <CashbackCharts
        timeSeries={timeSeries}
        statusDistribution={statusDistribution}
        topCompanies={topCompanies}
      />
    </div>
  );
}


