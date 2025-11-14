"use client";

import { useMemo } from "react";

import type { CompanyWithDetails, CompanyRankingHistory, PriceHistoryPoint } from "@/lib/types";
import { getCompareColor } from "@/lib/compare";

export interface PriceChartData {
  chartData: Array<Record<string, string | number>>;
  priceStats: Array<{ name: string; min: number; max: number; avg: number; color: string }>;
  chartConfig: Record<string, { label: string; color: string }>;
  hasHistoricalData: boolean;
}

export interface RatingChartData {
  chartData: Array<Record<string, string | number>>;
  ratingStats: Array<{
    name: string;
    current: number;
    avgHistorical: number;
    trend: number;
    color: string;
  }>;
  chartConfig: Record<string, { label: string; color: string }>;
  hasHistoricalData: boolean;
}

interface UseComparisonChartsParams {
  companies: CompanyWithDetails[];
  priceHistory: Record<string, PriceHistoryPoint[]>;
  ratingHistory: Record<string, CompanyRankingHistory[]>;
}

export function useComparisonCharts({
  companies,
  priceHistory,
  ratingHistory,
}: UseComparisonChartsParams) {
  const priceChart = useMemo<PriceChartData>(() => {
    const dataMap = new Map<string, Record<string, number>>();

    companies.forEach((company) => {
      const history = priceHistory[company.id] || [];

      history.forEach((point) => {
        const date = new Date(point.recordedAt).toLocaleDateString("pl-PL", {
          month: "short",
          year: "numeric",
        });

        if (!dataMap.has(date)) {
          dataMap.set(date, {});
        }

        const entry = dataMap.get(date)!;
        entry[company.name] = point.price;
      });
    });

    const chartData = Array.from(dataMap.entries())
      .map(([date, values]) => ({
        date,
        ...values,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });

    const priceStats = companies.map((company, idx) => {
      const plans = company.plans || [];
      const prices = plans.map((p) => Number(p.price));

      return {
        name: company.name,
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
        avg: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
        color: getCompareColor(idx),
      };
    });

    const chartConfig: Record<string, { label: string; color: string }> = {};
    companies.forEach((company, idx) => {
      chartConfig[company.name] = {
        label: company.name,
        color: getCompareColor(idx),
      };
    });

    return {
      chartData,
      priceStats,
      chartConfig,
      hasHistoricalData: chartData.length > 0,
    };
  }, [companies, priceHistory]);

  const ratingChart = useMemo<RatingChartData>(() => {
    const dataMap = new Map<string, Record<string, number>>();

    companies.forEach((company) => {
      const history = ratingHistory[company.id] || [];

      history.forEach((point) => {
        const date = new Date(point.recordedAt).toLocaleDateString("pl-PL", {
          month: "short",
          year: "numeric",
        });

        if (!dataMap.has(date)) {
          dataMap.set(date, {});
        }

        const entry = dataMap.get(date)!;
        entry[company.name] = point.overallScore;
      });
    });

    const chartData = Array.from(dataMap.entries())
      .map(([date, values]) => ({
        date,
        ...values,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });

    const ratingStats = companies.map((company, idx) => {
      const history = ratingHistory[company.id] || [];
      const scores = history.map((h) => h.overallScore);
      const avgHistorical =
        scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const trend = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0;

      return {
        name: company.name,
        current: company.rating ?? 0,
        avgHistorical,
        trend,
        color: getCompareColor(idx),
      };
    });

    const chartConfig: Record<string, { label: string; color: string }> = {};
    companies.forEach((company, idx) => {
      chartConfig[company.name] = {
        label: company.name,
        color: getCompareColor(idx),
      };
    });

    return {
      chartData,
      ratingStats,
      chartConfig,
      hasHistoricalData: chartData.length > 0,
    };
  }, [companies, ratingHistory]);

  return {
    priceChart,
    ratingChart,
  };
}
