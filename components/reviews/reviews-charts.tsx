"use client";

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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import type { ReviewsRankingItem } from "@/lib/queries/reviews";
import { useMemo } from "react";

interface ReviewsChartsProps {
  items: ReviewsRankingItem[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--emerald-500))",
  "hsl(var(--yellow-500))",
  "hsl(var(--blue-500))",
  "hsl(var(--purple-500))",
  "hsl(var(--pink-500))",
  "hsl(var(--orange-500))",
  "hsl(var(--cyan-500))",
  "hsl(var(--indigo-500))",
];

export function ReviewsCharts({ items }: ReviewsChartsProps) {
  const topCompaniesBarData = useMemo(() => {
    return items
      .slice(0, 10)
      .map((item, index) => ({
        name: item.companyName.length > 15 
          ? item.companyName.substring(0, 15) + "..." 
          : item.companyName,
        fullName: item.companyName,
        slug: item.companySlug,
        rating: item.averageRating ?? 0,
        totalReviews: item.totalReviews,
        rank: index + 1,
      }));
  }, [items]);

  const ratingDistributionData = useMemo(() => {
    const ranges = [
      { name: "4.5-5.0", min: 4.5, max: 5.0, count: 0 },
      { name: "4.0-4.4", min: 4.0, max: 4.4, count: 0 },
      { name: "3.5-3.9", min: 3.5, max: 3.9, count: 0 },
      { name: "3.0-3.4", min: 3.0, max: 3.4, count: 0 },
      { name: "0-2.9", min: 0, max: 2.9, count: 0 },
    ];

    items.forEach((item) => {
      const rating = item.averageRating;
      if (rating !== null) {
        const range = ranges.find((r) => rating >= r.min && rating <= r.max);
        if (range) {
          range.count++;
        }
      }
    });

    return ranges.filter((r) => r.count > 0);
  }, [items]);

  const categoryComparisonData = useMemo(() => {
    const categories = ["tradingConditions", "customerSupport", "userExperience", "payoutExperience"];
    const categoryLabels = ["Warunki", "Obsługa", "Doświadczenie", "Wypłaty"];
    
    const totals = categories.reduce((acc, cat) => {
      acc[cat] = { sum: 0, count: 0 };
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    items.forEach((item) => {
      categories.forEach((cat) => {
        const value = item.categories[cat as keyof typeof item.categories];
        if (value !== null && value !== undefined) {
          totals[cat].sum += value;
          totals[cat].count++;
        }
      });
    });

    return categories.map((cat, index) => ({
      category: categoryLabels[index],
      average: totals[cat].count > 0 ? totals[cat].sum / totals[cat].count : 0,
      max: 5,
    }));
  }, [items]);

  const barConfig = {
    rating: {
      label: "Średnia ocena",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Bar Chart: Top 10 Companies by Rating */}
      <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle>Top 10 firm według średniej oceny</CardTitle>
          <CardDescription>
            Porównanie średnich ocen top 10 firm w rankingu opinii.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={topCompaniesBarData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  domain={[0, 5]}
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border/60 bg-card/72 p-3 shadow-xs">
                          <p className="font-semibold text-foreground">{data.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            Pozycja: #{data.rank}
                          </p>
                          <p className="text-sm text-foreground">
                            Ocena: {data.rating.toFixed(2)} / 5.0
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.totalReviews.toLocaleString("pl-PL")} opinii
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="rating"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart: Rating Distribution */}
        <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle>Rozkład ocen</CardTitle>
            <CardDescription>
              Liczba firm w poszczególnych przedziałach średnich ocen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ratingDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="count"
                  >
                    {ratingDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="rounded-lg border border-border/60 bg-card/72 p-2 shadow-xs">
                            <p className="text-sm font-semibold text-foreground">
                              {data.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {data.value} firm
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

        {/* Radar Chart: Category Comparison */}
        <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle>Porównanie kategorii</CardTitle>
            <CardDescription>
              Średnie oceny w poszczególnych kategoriach dla wszystkich firm.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={categoryComparisonData}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis
                    dataKey="category"
                    className="text-xs text-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 5]}
                    className="text-xs text-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Radar
                    name="Średnia ocena"
                    dataKey="average"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border/60 bg-card/72 p-2 shadow-xs">
                            <p className="text-sm font-semibold text-foreground">
                              {data.category}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {data.average.toFixed(2)} / 5.0
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

