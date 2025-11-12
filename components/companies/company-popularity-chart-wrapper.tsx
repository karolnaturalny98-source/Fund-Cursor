"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/analysis/loading-skeleton";
import type { CompanyRankingHistory } from "@/lib/types";

const CompanyPopularityChart = dynamic(
  () => import("./company-popularity-chart").then((mod) => ({ default: mod.CompanyPopularityChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface CompanyPopularityChartWrapperProps {
  rankingHistory: CompanyRankingHistory[];
  companyName: string;
}

export function CompanyPopularityChartWrapper({ rankingHistory, companyName }: CompanyPopularityChartWrapperProps) {
  return <CompanyPopularityChart rankingHistory={rankingHistory} companyName={companyName} />;
}

