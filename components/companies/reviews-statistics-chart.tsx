"use client";

import { useMemo } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useFadeIn } from "@/lib/animations";

interface ReviewCardData {
  id: string;
  rating: number;
  recommended: boolean | null;
}

interface ReviewsStatisticsChartProps {
  reviews: ReviewCardData[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--emerald-500))",
  "hsl(var(--blue-500))",
  "hsl(var(--amber-500))",
  "hsl(var(--rose-500))",
];

export function ReviewsStatisticsChart({ reviews }: ReviewsStatisticsChartProps) {
  const chartAnim = useFadeIn({ rootMargin: "-100px" });

  const ratingDistribution = useMemo(() => {
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      const roundedRating = Math.round(review.rating);
      if (roundedRating >= 1 && roundedRating <= 5) {
        distribution[roundedRating as keyof typeof distribution]++;
      }
    });

    return [
      { rating: "5 ⭐", value: distribution[5], color: CHART_COLORS[1] },
      { rating: "4 ⭐", value: distribution[4], color: CHART_COLORS[2] },
      { rating: "3 ⭐", value: distribution[3], color: CHART_COLORS[3] },
      { rating: "2 ⭐", value: distribution[2], color: CHART_COLORS[4] },
      { rating: "1 ⭐", value: distribution[1], color: CHART_COLORS[4] },
    ].filter((item) => item.value > 0);
  }, [reviews]);

  const recommendationDistribution = useMemo(() => {
    const recommended = reviews.filter((r) => r.recommended === true).length;
    const notRecommended = reviews.filter((r) => r.recommended === false).length;
    const noAnswer = reviews.filter((r) => r.recommended === null).length;

    return [
      { name: "Polecają", value: recommended, color: CHART_COLORS[1] },
      { name: "Nie polecają", value: notRecommended, color: CHART_COLORS[4] },
      { name: "Brak odpowiedzi", value: noAnswer, color: "hsl(var(--muted-foreground))" },
    ].filter((item) => item.value > 0);
  }, [reviews]);

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div ref={chartAnim.ref} className={`space-y-6 ${chartAnim.className}`}>
      {/* Bar Chart - Rozkład ocen */}
      {ratingDistribution.length > 0 && (
        <Card className="rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold sm:text-2xl">
                Rozkład ocen
              </CardTitle>
            </div>
            <CardDescription>
              Liczba opinii według oceny (1-5 gwiazdek).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={ratingDistribution.reduce((acc, item) => {
                acc[item.rating] = {
                  label: item.rating,
                  color: item.color,
                };
                return acc;
              }, {} as Record<string, { label: string; color: string }>)}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="rating"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border/40 bg-[rgba(8,10,13,0.82)] px-3 py-2 shadow-lg !backdrop-blur-[36px]">
                            <p className="text-sm font-semibold text-foreground">{data.rating}</p>
                            <p className="text-xs text-muted-foreground">
                              {data.value} opin{data.value === 1 ? "ia" : data.value < 5 ? "ie" : "ii"}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Pie Chart - Rozkład rekomendacji */}
      {recommendationDistribution.length > 0 && (
        <Card className="rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold sm:text-2xl">
                Rozkład rekomendacji
              </CardTitle>
            </div>
            <CardDescription>
              Procentowy rozkład opinii według rekomendacji.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={recommendationDistribution.reduce((acc, item) => {
                acc[item.name] = {
                  label: item.name,
                  color: item.color,
                };
                return acc;
              }, {} as Record<string, { label: string; color: string }>)}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recommendationDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {recommendationDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border/40 bg-[rgba(8,10,13,0.82)] px-3 py-2 shadow-lg !backdrop-blur-[36px]">
                            <p className="text-sm font-semibold text-foreground">{data.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {data.value} opin{data.value === 1 ? "ia" : data.value < 5 ? "ie" : "ii"} ({(data.percent * 100).toFixed(1)}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

