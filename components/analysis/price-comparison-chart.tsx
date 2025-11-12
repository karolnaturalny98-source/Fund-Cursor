"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { getCompareColor } from "@/lib/compare";
import type { CompanyWithDetails, PriceHistoryPoint } from "@/lib/types";

interface PriceComparisonChartProps {
  companies: CompanyWithDetails[];
  priceHistory: Record<string, PriceHistoryPoint[]>;
}

export function PriceComparisonChart({ companies, priceHistory }: PriceComparisonChartProps) {
  // Prepare chart data by aggregating all plans
  const chartData = useMemo(() => {
    const dataMap = new Map<string, Record<string, number>>();

    companies.forEach((company, idx) => {
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
  }, [companies, priceHistory]);

  // Calculate current price statistics
  const priceStats = useMemo(() => {
    return companies.map((company) => {
      const plans = company.plans || [];
      const prices = plans.map((p) => Number(p.price));
      
      return {
        name: company.name,
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
        avg: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
      };
    });
  }, [companies]);

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
        <CardTitle>Porównanie Cen Planów</CardTitle>
        <CardDescription>
          Historia cen i obecne przedziały cenowe dla wszystkich planów
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Price Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {priceStats.map((stat, idx) => (
            <div
              key={stat.name}
              className="rounded-lg border border-border/60 bg-[rgba(12,14,18,0.6)] !backdrop-blur-[36px] p-4"
              style={{ borderLeftWidth: "4px", borderLeftColor: getCompareColor(idx) }}
            >
              <h4 className="mb-2 font-semibold">{stat.name}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min:</span>
                  <span className="font-medium">${stat.min.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Średnia:</span>
                  <span className="font-medium">${stat.avg.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max:</span>
                  <span className="font-medium">${stat.max.toFixed(0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Historical Chart */}
        {hasHistoricalData ? (
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: "Cena (USD)", angle: -90, position: "insideLeft" }}
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
                                ${typeof item.value === 'number' ? item.value.toFixed(2) : item.value}
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
                  <Line
                    key={company.id}
                    type="monotone"
                    dataKey={company.name}
                    stroke={getCompareColor(idx)}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
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

