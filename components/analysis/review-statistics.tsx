"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell } from "recharts";
import { Star, MessageSquare, ThumbsUp, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { getCompareColor } from "@/lib/compare";
import type { CompanyWithDetails } from "@/lib/types";
import type { ReviewStatistics as ReviewStatsType } from "@/lib/queries/analysis";

interface ReviewStatisticsProps {
  companies: CompanyWithDetails[];
  reviewStatistics: Record<string, ReviewStatsType>;
}

export function ReviewStatistics({ companies, reviewStatistics }: ReviewStatisticsProps) {
  // Prepare data for rating distribution chart
  const ratingDistributionData = useMemo(() => {
    return [1, 2, 3, 4, 5].map((rating) => {
      const data: Record<string, number | string> = { rating: `${rating}⭐` };
      
      companies.forEach((company) => {
        const stats = reviewStatistics[company.id];
        if (stats) {
          data[company.name] = stats.ratingDistribution[rating] || 0;
        }
      });

      return data;
    });
  }, [companies, reviewStatistics]);

  // Prepare summary statistics
  const summaryStats = useMemo(() => {
    return companies.map((company) => {
      const stats = reviewStatistics[company.id];
      return {
        companyName: company.name,
        companyId: company.id,
        totalReviews: stats?.totalReviews || 0,
        averageRating: stats?.averageRating || 0,
        verifiedCount: stats?.verifiedCount || 0,
        recommendationRate: stats?.recommendationRate || 0,
      };
    });
  }, [companies, reviewStatistics]);

  // Build chart config for ChartContainer
  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    companies.forEach((company, idx) => {
      config[company.name] = {
        label: company.name,
        color: getCompareColor(idx),
      };
    });
    return config;
  }, [companies]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Statystyki Opinii</h2>
        <p className="text-sm text-muted-foreground">
          Szczegółowa analiza recenzji użytkowników
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryStats.map((stat, idx) => (
          <Card key={stat.companyId} className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{stat.companyName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Opinie
                </div>
                <span className="text-lg font-bold">{stat.totalReviews}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4" />
                  Średnia
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold">{stat.averageRating.toFixed(1)}</span>
                  <span className="text-yellow-500">⭐</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  Zweryfikowane
                </div>
                <Badge variant="secondary">
                  {stat.verifiedCount}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ThumbsUp className="h-4 w-4" />
                  Rekomendacje
                </div>
                <span className="text-lg font-bold text-primary">
                  {stat.recommendationRate.toFixed(0)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rating Distribution Chart */}
      <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle>Rozkład Ocen</CardTitle>
          <CardDescription>
            Liczba opinii według oceny gwiazdkowej
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={ratingDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="rating"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: "Liczba opinii", angle: -90, position: "insideLeft" }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border/60 bg-[rgba(10,12,15,0.72)] p-3 shadow-xs">
                          <p className="text-xs text-muted-foreground mb-2">
                            {payload[0].payload.rating}
                          </p>
                          {payload.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-muted-foreground">{item.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                {typeof item.value === 'number' ? item.value : String(item.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {companies.map((company, idx) => (
                  <Bar
                    key={company.id}
                    dataKey={company.name}
                    fill={getCompareColor(idx)}
                    radius={[8, 8, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

