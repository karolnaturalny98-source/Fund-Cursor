"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/analysis/loading-skeleton";
import type { CompanyWithDetails } from "@/lib/types";

const PayoutsCharts = dynamic(
  () => import("./payouts-charts").then((mod) => ({ default: mod.PayoutsCharts })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface PayoutsChartsWrapperProps {
  company: CompanyWithDetails;
}

export function PayoutsChartsWrapper({ company }: PayoutsChartsWrapperProps) {
  return <PayoutsCharts company={company} />;
}

