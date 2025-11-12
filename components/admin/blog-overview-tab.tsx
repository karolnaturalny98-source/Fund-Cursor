"use client";

import { BlogStatisticsOverview } from "./blog-statistics-overview";
import { BlogCharts } from "./blog-charts";
import type {
  BlogStats,
  BlogTimeSeriesPoint,
  StatusDistribution,
  TopBlogCategory,
  TopBlogAuthor,
} from "@/lib/queries/blog-stats";

interface BlogOverviewTabProps {
  stats: BlogStats;
  timeSeries: BlogTimeSeriesPoint[];
  statusDistribution: StatusDistribution[];
  topCategories: TopBlogCategory[];
  topAuthors: TopBlogAuthor[];
}

export function BlogOverviewTab({
  stats,
  timeSeries,
  statusDistribution,
  topCategories,
  topAuthors,
}: BlogOverviewTabProps) {
  return (
    <div className="space-y-6">
      <BlogStatisticsOverview stats={stats} />
      <BlogCharts
        timeSeries={timeSeries}
        statusDistribution={statusDistribution}
        topCategories={topCategories}
        topAuthors={topAuthors}
      />
    </div>
  );
}

