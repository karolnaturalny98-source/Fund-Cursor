"use client";

import { useMemo } from "react";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
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
} from "recharts";
import { useFadeIn } from "@/lib/animations";
import type { CompanyWithDetails } from "@/lib/types";

interface PayoutsChartsProps {
  company: CompanyWithDetails;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--emerald-500))",
  "hsl(var(--blue-500))",
  "hsl(var(--amber-500))",
  "hsl(var(--rose-500))",
  "hsl(var(--purple-500))",
];

export function PayoutsCharts({ company }: PayoutsChartsProps) {
  const sectionAnim = useFadeIn({ rootMargin: "-50px" });

  // Bar Chart - Cykle wypłat
  const cycleChartData = useMemo(() => {
    return company.plans
      .filter((plan) => plan.payoutCycleDays !== null && plan.payoutCycleDays !== undefined)
      .map((plan) => ({
        name: plan.name.length > 20 ? `${plan.name.substring(0, 20)}...` : plan.name,
        fullName: plan.name,
        cycle: plan.payoutCycleDays ?? 0,
      }))
      .sort((a, b) => a.cycle - b.cycle);
  }, [company.plans]);

  // Pie Chart - Rozkład profit split
  const profitSplitChartData = useMemo(() => {
    const splitGroups: Record<string, number> = {};
    
    company.plans.forEach((plan) => {
      if (!plan.profitSplit) {
        splitGroups["Brak danych"] = (splitGroups["Brak danych"] || 0) + 1;
        return;
      }
      
      const match = /^(\d{1,3})/.exec(plan.profitSplit);
      if (!match) {
        splitGroups["Brak danych"] = (splitGroups["Brak danych"] || 0) + 1;
        return;
      }
      
      const value = parseInt(match[1], 10);
      let group = "";
      if (value >= 90) group = "90-100%";
      else if (value >= 80) group = "80-89%";
      else if (value >= 70) group = "70-79%";
      else if (value >= 60) group = "60-69%";
      else group = "<60%";
      
      splitGroups[group] = (splitGroups[group] || 0) + 1;
    });

    return Object.entries(splitGroups).map(([name, value], index) => ({
      name,
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [company.plans]);

  // Line Chart - Timeline wypłat (pierwsza wypłata)
  const timelineChartData = useMemo(() => {
    const today = new Date();
    const data: Array<{ day: number; date: string; plans: string[]; count: number }> = [];
    const planDates: Record<number, string[]> = {};

    company.plans.forEach((plan) => {
      if (!plan.payoutFirstAfterDays) return;
      const days = plan.payoutFirstAfterDays;
      if (!planDates[days]) {
        planDates[days] = [];
      }
      planDates[days].push(plan.name);
    });

    Object.keys(planDates)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((days) => {
        const date = new Date(today);
        date.setDate(date.getDate() + days);
        data.push({
          day: days,
          date: date.toLocaleDateString("pl-PL", { day: "numeric", month: "short" }),
          plans: planDates[days],
          count: planDates[days].length,
        });
      });

    return data;
  }, [company.plans]);

  if (company.plans.length === 0) {
    return null;
  }

  return (
    <div ref={sectionAnim.ref} className={`space-y-4 ${sectionAnim.className}`}>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold sm:text-xl">Wizualizacje wypłat</h2>
        <p className="text-xs text-muted-foreground">
          Wykresy przedstawiające rozkład parametrów wypłat dla wszystkich planów.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Bar Chart - Cykle wypłat */}
        {cycleChartData.length > 0 && (
          <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Cykl wypłat</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Porównanie cykli wypłat między planami
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  cycle: {
                    label: "Dni",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[250px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cycleChartData} layout="vertical" margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-md border border-border/60 bg-card/82 backdrop-blur-[36px]! p-2 shadow-md">
                              <p className="text-xs font-semibold text-foreground">{data.fullName}</p>
                              <p className="text-xs text-primary">
                                {data.cycle} {data.cycle === 1 ? "dzień" : "dni"}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="cycle" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Pie Chart - Rozkład profit split */}
        {profitSplitChartData.length > 0 && (
          <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Rozkład profit split</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Grupowanie planów według profit split
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={profitSplitChartData.reduce((acc, item) => {
                  acc[item.name] = {
                    label: item.name,
                    color: item.fill,
                  };
                  return acc;
                }, {} as Record<string, { label: string; color: string }>)}
                className="h-[250px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={profitSplitChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {profitSplitChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="rounded-md border border-border/60 bg-card/82 backdrop-blur-[36px]! p-2 shadow-md">
                              <p className="text-xs font-semibold text-foreground">{data.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {data.value} {data.value === 1 ? "plan" : "planów"}
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

      {/* Line Chart - Timeline pierwszej wypłaty */}
      {timelineChartData.length > 0 && (
        <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Timeline pierwszej wypłaty</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Kiedy można oczekiwać pierwszej wypłaty dla każdego planu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Liczba planów",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineChartData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-md border border-border/60 bg-card/82 backdrop-blur-[36px]! p-2 shadow-md">
                            <p className="text-xs font-semibold text-foreground">
                              {data.day} {data.day === 1 ? "dzień" : "dni"}
                            </p>
                            <p className="text-xs text-muted-foreground">{data.date}</p>
                            <p className="text-xs text-primary mt-1">
                              {data.count} {data.count === 1 ? "plan" : "planów"}
                            </p>
                            {data.plans.length > 0 && (
                              <div className="mt-1 flex flex-col fluid-stack-2xs">
                                {data.plans.slice(0, 3).map((plan: string, idx: number) => (
                                  <p key={idx} className="text-[10px] text-muted-foreground">
                                    • {plan}
                                  </p>
                                ))}
                                {data.plans.length > 3 && (
                                  <p className="text-[10px] text-muted-foreground">
                                    +{data.plans.length - 3} więcej
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

