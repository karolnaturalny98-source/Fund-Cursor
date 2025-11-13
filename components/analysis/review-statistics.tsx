"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
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
    <div className="space-y-[clamp(1.5rem,2.2vw,2.25rem)]">
      <div className="space-y-[clamp(0.6rem,0.9vw,0.85rem)]">
        <h2 className="fluid-h2 font-bold">Statystyki Opinii</h2>
        <p className="fluid-copy text-muted-foreground">
          Szczegółowa analiza recenzji użytkowników
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] sm:grid-cols-2 lg:grid-cols-3">
        {summaryStats.map((stat, _idx) => (
          <Card key={stat.companyId} className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
            <CardHeader className="pb-[clamp(0.75rem,1.1vw,1rem)]">
              <CardTitle className="text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
                {stat.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
              <div className="flex items-center justify-between gap-[clamp(0.5rem,0.8vw,0.7rem)]">
                <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                  <MessageSquare className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                  Opinie
                </div>
                <span className="text-[clamp(1.1rem,0.5vw+1rem,1.35rem)] font-bold text-foreground">
                  {stat.totalReviews}
                </span>
              </div>

              <div className="flex items-center justify-between gap-[clamp(0.5rem,0.8vw,0.7rem)]">
                <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                  <Star className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                  Średnia
                </div>
                <div className="flex items-center gap-[clamp(0.35rem,0.5vw,0.45rem)]">
                  <span className="text-[clamp(1.1rem,0.5vw+1rem,1.35rem)] font-bold text-foreground">
                    {stat.averageRating.toFixed(1)}
                  </span>
                  <span className="text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] text-yellow-500">⭐</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-[clamp(0.5rem,0.8vw,0.7rem)]">
                <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                  <ShieldCheck className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                  Zweryfikowane
                </div>
                <Badge variant="secondary" className="fluid-badge font-semibold">
                  {stat.verifiedCount}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-[clamp(0.5rem,0.8vw,0.7rem)]">
                <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                  <ThumbsUp className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                  Rekomendacje
                </div>
                <span className="text-[clamp(1.1rem,0.5vw+1rem,1.35rem)] font-bold text-primary">
                  {stat.recommendationRate.toFixed(0)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rating Distribution Chart */}
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle className="text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
            Rozkład Ocen
          </CardTitle>
          <CardDescription className="fluid-caption">
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
                  className="fluid-caption text-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="fluid-caption text-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: "Liczba opinii", angle: -90, position: "insideLeft" }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border/60 bg-card/72 p-3 shadow-xs">
                          <p className="text-xs text-muted-foreground mb-2">
                            {payload[0].payload.rating}
                          </p>
                          {payload.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full bg-[var(--bg-color)]"
                                  style={{ "--bg-color": item.color } as React.CSSProperties}
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

