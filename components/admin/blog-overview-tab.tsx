"use client";

import dynamic from "next/dynamic";
import { BlogStatisticsOverview } from "./blog-statistics-overview";
import { ChartSkeleton } from "@/components/analysis/loading-skeleton";

const BlogCharts = dynamic(
  () => import("./blog-charts").then((mod) => ({ default: mod.BlogCharts })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
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
    <div className="flex flex-col fluid-stack-md">
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


