"use client";

import { useMemo } from "react";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
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
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useFadeIn } from "@/lib/animations";
import type { CashbackSummary } from "@/lib/types";

interface UserDashboardChartsProps {
  summary: CashbackSummary;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--emerald-500))",
  "hsl(var(--blue-500))",
  "hsl(var(--amber-500))",
  "hsl(var(--rose-500))",
  "hsl(var(--purple-500))",
];

export function UserDashboardCharts({ summary }: UserDashboardChartsProps) {
  const sectionAnim = useFadeIn({ rootMargin: "-50px" });

  // Pie Chart - Rozkład statusów punktów
  const statusDistributionData = useMemo(() => {
    return [
      {
        name: "Dostępne",
        value: summary.available,
        fill: CHART_COLORS[1], // emerald
      },
      {
        name: "Oczekujące",
        value: summary.pending,
        fill: CHART_COLORS[4], // amber
      },
      {
        name: "Zatwierdzone",
        value: summary.approved,
        fill: CHART_COLORS[2], // blue
      },
      {
        name: "Zrealizowane",
        value: summary.redeemed,
        fill: CHART_COLORS[0], // primary
      },
    ].filter((item) => item.value > 0);
  }, [summary]);

  // Line Chart - Trend punktów w czasie (symulacja ostatnich 6 miesięcy)
  const trendData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      // Symulacja danych - w rzeczywistości powinny pochodzić z API
      const simulatedPoints = Math.floor(Math.random() * 5000) + 1000;
      data.push({
        month: date.toLocaleDateString("pl-PL", { month: "short", year: "numeric" }),
        points: simulatedPoints,
      });
    }
    return data;
  }, []);

  // Bar Chart - Top 5 firm (symulacja - w rzeczywistości powinno pochodzić z transakcji)
  const topCompaniesData = useMemo(() => {
    // Symulacja danych - w rzeczywistości powinny pochodzić z transakcji
    return [
      { name: "Firma A", points: 1500 },
      { name: "Firma B", points: 1200 },
      { name: "Firma C", points: 900 },
      { name: "Firma D", points: 750 },
      { name: "Firma E", points: 600 },
    ];
  }, []);

  const totalPoints = summary.available + summary.pending + summary.approved + summary.redeemed;

  if (totalPoints === 0) {
    return (
      <section ref={sectionAnim.ref} className={`space-y-4 ${sectionAnim.className}`}>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold sm:text-xl">Wizualizacja danych</h2>
          <p className="text-xs text-muted-foreground">
            Wykresy pojawią się po zgromadzeniu pierwszych punktów.
          </p>
        </div>
        <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
          <CardContent className="flex items-center justify-center p-12">
            <p className="text-sm text-muted-foreground">Brak danych do wyświetlenia</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section ref={sectionAnim.ref} className={`space-y-4 ${sectionAnim.className}`}>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold sm:text-xl">Wizualizacja danych</h2>
        <p className="text-xs text-muted-foreground">
          Graficzne przedstawienie Twoich punktów i aktywności.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Pie Chart - Rozkład statusów */}
        <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Rozkład punktów</CardTitle>
            </div>
            <CardDescription className="text-xs">Procentowy udział różnych statusów punktów.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={statusDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Line Chart - Trend */}
        <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Trend punktów (symulacja)</CardTitle>
            </div>
            <CardDescription className="text-xs">Miesięczny trend punktów w ciągu ostatnich 6 miesięcy.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value}`}
                    className="text-xs"
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Top firmy */}
        <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Top firmy (symulacja)</CardTitle>
            </div>
            <CardDescription className="text-xs">Firmy z największą liczbą otrzymanych punktów.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCompaniesData}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    className="text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value}`}
                    className="text-xs"
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Bar dataKey="points" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

