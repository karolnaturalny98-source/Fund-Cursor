"use client";

import dynamic from "next/dynamic";
import { ContentStatisticsOverview } from "./content-statistics-overview";
import { ChartSkeleton } from "@/components/analysis/loading-skeleton";

const ContentCharts = dynamic(
  () => import("./content-charts").then((mod) => ({ default: mod.ContentCharts })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
import type {
  ContentStats,
  ContentTimeSeriesPoint,
  StatusDistribution,
  TopCompany,
} from "@/lib/queries/content-stats";

interface ContentOverviewTabProps {
  stats: ContentStats;
  timeSeries: ContentTimeSeriesPoint[];
  statusDistribution: {
    companies: StatusDistribution[];
    plans: StatusDistribution[];
  };
  topCompanies: TopCompany[];
}

export function ContentOverviewTab({
  stats,
  timeSeries,
  statusDistribution,
  topCompanies,
}: ContentOverviewTabProps) {
  return (
    <div className="space-y-6">
      <ContentStatisticsOverview stats={stats} />
      <ContentCharts
        timeSeries={timeSeries}
        statusDistribution={statusDistribution}
        topCompanies={topCompanies}
      />
    </div>
  );
}

