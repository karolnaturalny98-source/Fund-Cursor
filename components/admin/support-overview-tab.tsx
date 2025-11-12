"use client";

import { SupportStatisticsOverview } from "./support-statistics-overview";
import { SupportCharts } from "./support-charts";
import type {
  SupportStats,
  SupportTimeSeriesPoint,
  StatusDistribution,
  TopDisputedCompany,
} from "@/lib/queries/support-stats";

interface SupportOverviewTabProps {
  stats: SupportStats;
  timeSeries: SupportTimeSeriesPoint[];
  statusDistribution: StatusDistribution[];
  topCompanies: TopDisputedCompany[];
}

export function SupportOverviewTab({
  stats,
  timeSeries,
  statusDistribution,
  topCompanies,
}: SupportOverviewTabProps) {
  return (
    <div className="space-y-6">
      <SupportStatisticsOverview stats={stats} />
      <SupportCharts
        timeSeries={timeSeries}
        statusDistribution={statusDistribution}
        topCompanies={topCompanies}
      />
    </div>
  );
}

