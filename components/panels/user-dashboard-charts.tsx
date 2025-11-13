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
      <section
        ref={sectionAnim.ref}
        className={`space-y-[clamp(1.5rem,2.2vw,2.1rem)] ${sectionAnim.className}`}
      >
        <div className="space-y-[clamp(0.35rem,0.55vw,0.5rem)]">
          <h2 className="fluid-h2 font-semibold text-foreground">Wizualizacja danych</h2>
          <p className="fluid-caption text-muted-foreground">
            Wykresy pojawią się po zgromadzeniu pierwszych punktów.
          </p>
        </div>
        <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardContent className="flex items-center justify-center p-[clamp(2.5rem,3.5vw,3.25rem)]">
            <p className="fluid-copy text-muted-foreground">Brak danych do wyświetlenia</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section
      ref={sectionAnim.ref}
      className={`space-y-[clamp(1.5rem,2.2vw,2.1rem)] ${sectionAnim.className}`}
    >
      <div className="space-y-[clamp(0.35rem,0.55vw,0.5rem)]">
        <h2 className="fluid-h2 font-semibold text-foreground">Wizualizacja danych</h2>
        <p className="fluid-caption text-muted-foreground">
          Graficzne przedstawienie Twoich punktów i aktywności.
        </p>
      </div>
      <div className="grid gap-[clamp(0.95rem,1.4vw,1.3rem)] lg:grid-cols-2 xl:grid-cols-3">
        {/* Pie Chart - Rozkład statusów */}
        <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
            <div className="flex items-center gap-[clamp(0.35rem,0.55vw,0.5rem)]">
              <PieChartIcon className="h-[clamp(1rem,0.4vw+0.9rem,1.1rem)] w-[clamp(1rem,0.4vw+0.9rem,1.1rem)] text-primary" />
              <CardTitle className="text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold text-foreground">
                Rozkład punktów
              </CardTitle>
            </div>
            <CardDescription className="fluid-caption">
              Procentowy udział różnych statusów punktów.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-[clamp(1.25rem,1.8vw,1.6rem)] pt-[clamp(0.25rem,0.5vw,0.45rem)]">
            <ChartContainer config={{}} className="h-[clamp(12rem,18vw,15rem)] w-full">
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
        <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
            <div className="flex items-center gap-[clamp(0.35rem,0.55vw,0.5rem)]">
              <TrendingUp className="h-[clamp(1rem,0.4vw+0.9rem,1.1rem)] w-[clamp(1rem,0.4vw+0.9rem,1.1rem)] text-primary" />
              <CardTitle className="text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold text-foreground">
                Trend punktów (symulacja)
              </CardTitle>
            </div>
            <CardDescription className="fluid-caption">
              Miesięczny trend punktów w ciągu ostatnich 6 miesięcy.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-[clamp(1.25rem,1.8vw,1.6rem)] pt-[clamp(0.25rem,0.5vw,0.45rem)]">
            <ChartContainer config={{}} className="h-[clamp(12rem,18vw,15rem)] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="fluid-caption text-muted-foreground"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value}`}
                    className="fluid-caption text-muted-foreground"
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
        <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
            <div className="flex items-center gap-[clamp(0.35rem,0.55vw,0.5rem)]">
              <BarChart3 className="h-[clamp(1rem,0.4vw+0.9rem,1.1rem)] w-[clamp(1rem,0.4vw+0.9rem,1.1rem)] text-primary" />
              <CardTitle className="text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold text-foreground">
                Top firmy (symulacja)
              </CardTitle>
            </div>
            <CardDescription className="fluid-caption">
              Firmy z największą liczbą otrzymanych punktów.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-[clamp(1.25rem,1.8vw,1.6rem)] pt-[clamp(0.25rem,0.5vw,0.45rem)]">
            <ChartContainer config={{}} className="h-[clamp(12rem,18vw,15rem)] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCompaniesData}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    className="fluid-caption text-muted-foreground"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value}`}
                    className="fluid-caption text-muted-foreground"
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Bar dataKey="points" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

