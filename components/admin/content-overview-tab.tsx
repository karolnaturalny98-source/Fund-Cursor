"use client";

import { ContentStatisticsOverview } from "./content-statistics-overview";
import { ContentCharts } from "./content-charts";
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

