"use client";

import { CommunityStatisticsOverview } from "./community-statistics-overview";
import { CommunityCharts } from "./community-charts";
import type { CommunityStats } from "@/lib/queries/community-stats";
import type {
  CommunityTimeSeriesPoint,
  StatusDistribution,
  TopInfluencer,
} from "@/lib/queries/community-stats";

interface CommunityOverviewTabProps {
  stats: CommunityStats;
  timeSeries: CommunityTimeSeriesPoint[];
  statusDistribution: StatusDistribution[];
  topInfluencers: TopInfluencer[];
}

export function CommunityOverviewTab({
  stats,
  timeSeries,
  statusDistribution,
  topInfluencers,
}: CommunityOverviewTabProps) {
  return (
    <div className="space-y-6">
      <CommunityStatisticsOverview stats={stats} />
      <CommunityCharts
        timeSeries={timeSeries}
        statusDistribution={statusDistribution}
        topInfluencers={topInfluencers}
      />
    </div>
  );
}

