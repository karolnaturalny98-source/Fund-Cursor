"use client";

import { useMemo } from "react";

import type { CompanyWithDetails } from "@/lib/types";
import type { ComparisonMetrics, ReviewStatistics } from "@/lib/queries/analysis";

export interface ComparisonMetricValue {
  companyName: string;
  companyId: string;
  value: number;
}

export interface ComparisonMetricsData {
  ratings: ComparisonMetricValue[];
  cashbackRates: ComparisonMetricValue[];
  avgPlanPrices: ComparisonMetricValue[];
  totalPlans: ComparisonMetricValue[];
  foundedYears: ComparisonMetricValue[];
  paymentMethodsCounts: ComparisonMetricValue[];
  instrumentsCounts: ComparisonMetricValue[];
  avgProfitSplits: ComparisonMetricValue[];
  avgLeverages: ComparisonMetricValue[];
}

export interface ComparisonCompanyCard {
  id: string;
  name: string;
  logoUrl: string | null;
  rating: number | null;
  country: string | null;
  highlights: Array<{ label: string; value: string }>;
}

export interface ComparisonReviewSummary {
  totalReviews: number;
  verifiedCount: number;
  averageRating: number;
}

interface UseComparisonDataParams {
  companies: CompanyWithDetails[];
  comparisonMetrics: Record<string, ComparisonMetrics>;
  reviewStatistics: Record<string, ReviewStatistics>;
}

export function useComparisonData({
  companies,
  comparisonMetrics,
  reviewStatistics,
}: UseComparisonDataParams) {
  const companyCards = useMemo<ComparisonCompanyCard[]>(() => {
    return companies.map((company) => {
      const metrics = comparisonMetrics[company.id];
      const reviews = reviewStatistics[company.id];

      const highlights: Array<{ label: string; value: string }> = [];

      if (typeof company.cashbackRate === "number" && company.cashbackRate > 0) {
        highlights.push({
          label: "Cashback",
          value: `${company.cashbackRate} pkt`,
        });
      }

      if (metrics?.totalPlans) {
        highlights.push({
          label: "Plany",
          value: `${metrics.totalPlans}`,
        });
      }

      if (reviews?.totalReviews) {
        highlights.push({
          label: "Opinie",
          value: `${reviews.totalReviews}`,
        });
      }

      return {
        id: company.id,
        name: company.name,
        logoUrl: company.logoUrl,
        rating: company.rating,
        country: company.country,
        highlights,
      };
    });
  }, [companies, comparisonMetrics, reviewStatistics]);

  const metrics = useMemo<ComparisonMetricsData>(() => {
    const toMetric = (company: CompanyWithDetails, value: number | null | undefined) => ({
      companyName: company.name,
      companyId: company.id,
      value: value ?? 0,
    });

    return {
      ratings: companies.map((company) => toMetric(company, company.rating ?? 0)),
      cashbackRates: companies.map((company) => toMetric(company, company.cashbackRate ?? 0)),
      avgPlanPrices: companies.map((company) =>
        toMetric(company, comparisonMetrics[company.id]?.avgPlanPrice ?? 0),
      ),
      totalPlans: companies.map((company) =>
        toMetric(company, comparisonMetrics[company.id]?.totalPlans ?? company.plans.length),
      ),
      foundedYears: companies
        .filter((company) => typeof company.foundedYear === "number")
        .map((company) => toMetric(company, company.foundedYear ?? 0)),
      paymentMethodsCounts: companies.map((company) =>
        toMetric(company, company.paymentMethods.length),
      ),
      instrumentsCounts: companies.map((company) =>
        toMetric(company, company.instruments.length),
      ),
      avgProfitSplits: companies
        .map((company) =>
          toMetric(company, comparisonMetrics[company.id]?.avgProfitSplit ?? 0),
        )
        .filter((entry) => entry.value > 0),
      avgLeverages: companies
        .map((company) => toMetric(company, comparisonMetrics[company.id]?.avgLeverage ?? 0))
        .filter((entry) => entry.value > 0),
    };
  }, [companies, comparisonMetrics]);

  const reviewSummary = useMemo<ComparisonReviewSummary>(() => {
    const totals = companies.map((company) => reviewStatistics[company.id]);

    const totalReviews = totals.reduce(
      (acc, stats) => acc + (stats?.totalReviews ?? 0),
      0,
    );
    const verifiedCount = totals.reduce(
      (acc, stats) => acc + (stats?.verifiedCount ?? 0),
      0,
    );
    const weightedSum = totals.reduce(
      (acc, stats) => acc + (stats?.averageRating ?? 0) * (stats?.totalReviews ?? 0),
      0,
    );

    const averageRating = totalReviews > 0 ? weightedSum / totalReviews : 0;

    return {
      totalReviews,
      verifiedCount,
      averageRating: Number(averageRating.toFixed(2)),
    };
  }, [companies, reviewStatistics]);

  return {
    companyCards,
    metrics,
    reviewSummary,
  };
}
