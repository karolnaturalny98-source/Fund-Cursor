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
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type {
  RankingCompanySnapshot,
  RankingTabId,
} from "@/lib/types/rankings";
import { useMemo } from "react";

interface RankingsChartsProps {
  companies: RankingCompanySnapshot[];
  activeTab: RankingTabId;
  maxValues: {
    reviewCount: number;
    favoritesCount: number;
    newReviews30d: number;
    clicks30d: number;
    cashbackAveragePoints: number;
  };
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

const TAB_LABELS: Record<RankingTabId, string> = {
  overall: "Ogólny",
  conditions: "Warunki",
  payouts: "Wypłaty",
  community: "Społeczność",
  cashback: "Cashback",
  growth: "Wzrost",
};

export function RankingsCharts({
  companies,
  activeTab,
  maxValues,
}: RankingsChartsProps) {
  const topCompaniesBarData = useMemo(() => {
    return companies
      .slice(0, 10)
      .map((company, index) => ({
        name: company.name.length > 15 
          ? company.name.substring(0, 15) + "..." 
          : company.name,
        fullName: company.name,
        slug: company.slug,
        score: company.scores[activeTab],
        reviewCount: company.reviewCount,
        favoritesCount: company.favoritesCount,
        rank: index + 1,
      }));
  }, [companies, activeTab]);

  const scoreDistributionData = useMemo(() => {
    const ranges = [
      { name: "90-100", min: 90, max: 100, count: 0 },
      { name: "80-89", min: 80, max: 89, count: 0 },
      { name: "70-79", min: 70, max: 79, count: 0 },
      { name: "60-69", min: 60, max: 69, count: 0 },
      { name: "0-59", min: 0, max: 59, count: 0 },
    ];

    companies.forEach((company) => {
      const score = company.scores[activeTab];
      const range = ranges.find((r) => score >= r.min && score <= r.max);
      if (range) {
        range.count++;
      }
    });

    return ranges.filter((r) => r.count > 0);
  }, [companies, activeTab]);

  const countriesDistributionData = useMemo(() => {
    const countryMap = new Map<string, number>();
    companies.forEach((company) => {
      if (company.country) {
        countryMap.set(
          company.country,
          (countryMap.get(company.country) || 0) + 1
        );
      }
    });

    return Array.from(countryMap.entries())
      .map(([country, count]) => ({
        name: country,
        value: count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [companies]);

  const barConfig = {
    score: {
      label: "Ocena",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Bar Chart: Top 10 Companies */}
      <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle>Top 10 firm - {TAB_LABELS[activeTab]}</CardTitle>
          <CardDescription>
            Porównanie ocen top 10 firm w rankingu {TAB_LABELS[activeTab].toLowerCase()}.
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
                  domain={[0, 100]}
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
                            Ocena: {data.score.toFixed(1)} / 100
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.reviewCount.toLocaleString("pl-PL")} opinii
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="score"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart: Score Distribution */}
        <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle>Rozkład ocen</CardTitle>
            <CardDescription>
              Liczba firm w poszczególnych przedziałach ocen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={scoreDistributionData}
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
                    {scoreDistributionData.map((entry, index) => (
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

        {/* Pie Chart: Countries Distribution */}
        {countriesDistributionData.length > 0 && (
          <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
            <CardHeader>
              <CardTitle>Top 5 krajów</CardTitle>
              <CardDescription>
                Rozkład firm według krajów pochodzenia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={countriesDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {countriesDistributionData.map((entry, index) => (
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
        )}
      </div>
    </div>
  );
}

