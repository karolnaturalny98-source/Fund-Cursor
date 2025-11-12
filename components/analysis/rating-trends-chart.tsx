"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { getCompareColor } from "@/lib/compare";
import type { CompanyWithDetails, CompanyRankingHistory } from "@/lib/types";

interface RatingTrendsChartProps {
  companies: CompanyWithDetails[];
  ratingHistory: Record<string, CompanyRankingHistory[]>;
}

export function RatingTrendsChart({ companies, ratingHistory }: RatingTrendsChartProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
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

    return Array.from(dataMap.entries())
      .map(([date, values]) => ({
        date,
        ...values,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  }, [companies, ratingHistory]);

  // Calculate rating statistics
  const ratingStats = useMemo(() => {
    return companies.map((company) => {
      const history = ratingHistory[company.id] || [];
      const currentRating = company.rating || 0;
      
      const scores = history.map((h) => h.overallScore);
      const avgHistorical = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
      
      const trend = scores.length >= 2
        ? scores[scores.length - 1] - scores[0]
        : 0;

      return {
        name: company.name,
        current: currentRating,
        avgHistorical,
        trend,
      };
    });
  }, [companies, ratingHistory]);

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

  const hasHistoricalData = chartData.length > 0;

  return (
    <Card className="col-span-full rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
      <CardHeader>
        <CardTitle>Trendy Ocen</CardTitle>
        <CardDescription>
          Historia i bieżące oceny firm w czasie
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Rating Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ratingStats.map((stat, idx) => (
            <div
              key={stat.name}
              className="rounded-lg border border-border/60 bg-[rgba(12,14,18,0.6)] !backdrop-blur-[36px] p-4"
              style={{ borderLeftWidth: "4px", borderLeftColor: getCompareColor(idx) }}
            >
              <h4 className="mb-2 font-semibold">{stat.name}</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bieżąca:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold">
                      {stat.current.toFixed(1)}
                    </span>
                    <span className="text-yellow-500">⭐</span>
                  </div>
                </div>
                {stat.avgHistorical > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Średnia hist.:</span>
                    <span className="font-medium">
                      {stat.avgHistorical.toFixed(1)}
                    </span>
                  </div>
                )}
                {stat.trend !== 0 && (
                  <Badge
                    variant={stat.trend > 0 ? "default" : "secondary"}
                    className="w-full justify-center"
                  >
                    {stat.trend > 0 ? "↗" : "↘"} {Math.abs(stat.trend).toFixed(1)} punktów
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Historical Chart */}
        {hasHistoricalData ? (
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  domain={[0, 5]}
                  label={{ value: "Ocena", angle: -90, position: "insideLeft" }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border/60 bg-[rgba(10,12,15,0.72)] p-3 shadow-sm">
                          <p className="text-xs text-muted-foreground mb-1">
                            {payload[0].payload.date}
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
                                {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
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
                  <Area
                    key={company.id}
                    type="monotone"
                    dataKey={company.name}
                    stroke={getCompareColor(idx)}
                    fill={getCompareColor(idx)}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              Brak danych historycznych dla wybranych firm
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

