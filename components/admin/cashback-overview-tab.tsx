"use client";

import dynamic from "next/dynamic";
import { CashbackStatisticsOverview } from "./cashback-statistics-overview";
import { ChartSkeleton } from "@/components/analysis/loading-skeleton";

const CashbackCharts = dynamic(
  () => import("./cashback-charts").then((mod) => ({ default: mod.CashbackCharts })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
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
    <div className="flex flex-col fluid-stack-md">
      <CashbackStatisticsOverview stats={stats} />
      <CashbackCharts
        timeSeries={timeSeries}
        statusDistribution={statusDistribution}
        topCompanies={topCompanies}
      />
    </div>
  );
}



