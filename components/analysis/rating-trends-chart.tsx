"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import type { RatingChartData } from "@/components/analysis/hooks/use-comparison-charts";

interface RatingTrendsChartProps {
  data: RatingChartData;
}

export function RatingTrendsChart({ data }: RatingTrendsChartProps) {
  const { chartData, ratingStats, chartConfig, hasHistoricalData } = data;
  const chartEntries = Object.entries(chartConfig);

  return (
    <Card className="col-span-full rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
      <CardHeader>
        <CardTitle>Trendy Ocen</CardTitle>
        <CardDescription>
          Historia i bieżące oceny firm w czasie
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Rating Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ratingStats.map((stat) => (
            <div
              key={stat.name}
              className="rounded-lg border border-border/60 bg-background/60 backdrop-blur-[36px]! p-4 border-l-4 border-[var(--border-color)]"
              style={{ "--border-color": stat.color } as React.CSSProperties}
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
                        <div className="rounded-lg border border-border/60 bg-card/72 p-3 shadow-xs">
                          <p className="text-xs text-muted-foreground mb-1">
                            {payload[0].payload.date}
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
                {chartEntries.map(([label, config]) => (
                  <Area
                    key={label}
                    type="monotone"
                    dataKey={label}
                    stroke={config.color}
                    fill={config.color}
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
