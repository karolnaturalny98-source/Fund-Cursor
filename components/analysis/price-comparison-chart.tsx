"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import type { PriceChartData } from "@/components/analysis/hooks/use-comparison-charts";

interface PriceComparisonChartProps {
  data: PriceChartData;
}

export function PriceComparisonChart({ data }: PriceComparisonChartProps) {
  const { chartData, priceStats, chartConfig, hasHistoricalData } = data;
  const chartEntries = Object.entries(chartConfig);

  return (
    <Card className="col-span-full rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
      <CardHeader>
        <CardTitle>Porównanie Cen Planów</CardTitle>
        <CardDescription>
          Historia cen i obecne przedziały cenowe dla wszystkich planów
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Price Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {priceStats.map((stat) => (
            <div
              key={stat.name}
              className="rounded-lg border border-border/60 bg-background/60 backdrop-blur-[36px]! p-4 border-l-4 border-[var(--border-color)]"
              style={{ "--border-color": stat.color } as React.CSSProperties}
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
                {chartEntries.map(([label, config]) => (
                  <Line
                    key={label}
                    type="monotone"
                    dataKey={label}
                    stroke={config.color}
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
