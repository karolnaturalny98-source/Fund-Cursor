"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { Calendar, TrendingUp, Percent } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { getCompareColor } from "@/lib/compare";
import type { CompanyWithDetails } from "@/lib/types";

interface PayoutAnalysisProps {
  companies: CompanyWithDetails[];
}

export function PayoutAnalysis({ companies }: PayoutAnalysisProps) {
  // Extract payout data
  const payoutData = useMemo(() => {
    return companies.map((company) => {
      const plans = company.plans || [];
      
      // Payout frequency
      const firstPayoutDays = plans
        .filter((p) => p.payoutFirstAfterDays !== null)
        .map((p) => p.payoutFirstAfterDays!);
      
      const cycleDays = plans
        .filter((p) => p.payoutCycleDays !== null)
        .map((p) => p.payoutCycleDays!);

      // Profit splits
      const profitSplits = plans
        .filter((p) => p.profitSplit)
        .map((p) => {
          const match = p.profitSplit!.match(/\d+/);
          return match ? parseInt(match[0]) : null;
        })
        .filter((s): s is number => s !== null);

      return {
        companyName: company.name,
        companyId: company.id,
        payoutFrequency: company.payoutFrequency,
        avgFirstPayoutDays: firstPayoutDays.length > 0
          ? firstPayoutDays.reduce((a, b) => a + b, 0) / firstPayoutDays.length
          : null,
        minFirstPayoutDays: firstPayoutDays.length > 0 ? Math.min(...firstPayoutDays) : null,
        avgCycleDays: cycleDays.length > 0
          ? cycleDays.reduce((a, b) => a + b, 0) / cycleDays.length
          : null,
        avgProfitSplit: profitSplits.length > 0
          ? profitSplits.reduce((a, b) => a + b, 0) / profitSplits.length
          : null,
        bestProfitSplit: profitSplits.length > 0 ? Math.max(...profitSplits) : null,
        plans: plans.map((p) => ({
          name: p.name,
          profitSplit: p.profitSplit,
          firstPayoutDays: p.payoutFirstAfterDays,
          cycleDays: p.payoutCycleDays,
        })),
      };
    });
  }, [companies]);

  // Prepare chart data for first payout comparison
  const firstPayoutChartData = payoutData
    .filter((d) => d.avgFirstPayoutDays !== null)
    .map((d) => ({
      name: d.companyName,
      days: d.avgFirstPayoutDays!,
    }));

  // Prepare chart data for profit splits
  const profitSplitChartData = payoutData
    .filter((d) => d.avgProfitSplit !== null)
    .map((d) => ({
      name: d.companyName,
      split: d.avgProfitSplit!,
    }));

  // Build chart config for ChartContainer
  const resolveColorByName = useMemo(() => {
    return (companyName: string) => {
      const index = companies.findIndex((company) => company.name === companyName);
      return getCompareColor(index);
    };
  }, [companies]);

  const firstPayoutConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    firstPayoutChartData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: resolveColorByName(item.name),
      };
    });
    return config;
  }, [firstPayoutChartData, resolveColorByName]);

  const profitSplitConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    profitSplitChartData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: resolveColorByName(item.name),
      };
    });
    return config;
  }, [profitSplitChartData, resolveColorByName]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analiza Wypłat</h2>
        <p className="text-sm text-muted-foreground">
          Szczegółowe porównanie warunków wypłat i podziału zysków
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {payoutData.map((data, idx) => (
          <Card
            key={data.companyId}
            className="border-l-4 bg-card/82 border-[var(--border-color)]"
            style={{ "--border-color": getCompareColor(idx) } as React.CSSProperties}
          >
            <CardHeader>
              <CardTitle className="text-base">{data.companyName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.payoutFrequency && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Częstotliwość
                  </div>
                  <Badge variant="secondary">{data.payoutFrequency}</Badge>
                </div>
              )}

              {data.minFirstPayoutDays !== null && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Pierwsza wypłata
                  </div>
                  <span className="text-lg font-bold">
                    {data.minFirstPayoutDays} dni
                  </span>
                </div>
              )}

              {data.avgCycleDays !== null && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Cykl wypłat
                  </div>
                  <span className="text-lg font-bold">
                    {data.avgCycleDays.toFixed(0)} dni
                  </span>
                </div>
              )}

              {data.bestProfitSplit !== null && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Percent className="h-4 w-4" />
                    Najlepszy podział
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {data.bestProfitSplit}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* First Payout Comparison Chart */}
      {firstPayoutChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Czas do Pierwszej Wypłaty</CardTitle>
            <CardDescription>
              Średnia liczba dni do pierwszej wypłaty dla każdej firmy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={firstPayoutConfig}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={firstPayoutChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                    className="text-xs text-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "Dni", angle: -90, position: "insideLeft" }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="glass-panel border border-border/60 p-3">
                            <p className="font-semibold text-foreground">{data.name}</p>
                            <p className="text-sm text-foreground">
                              {typeof payload[0].value === 'number' ? `${payload[0].value.toFixed(1)} dni` : payload[0].value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="days" radius={[8, 8, 0, 0]} fill="hsl(var(--primary))">
                    {firstPayoutChartData.map((entry) => (
                      <Cell key={entry.name} fill={resolveColorByName(entry.name)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Profit Split Comparison */}
      {profitSplitChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Porównanie Podziału Zysku</CardTitle>
            <CardDescription>
              Średni procent podziału zysku dla tradera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={profitSplitConfig}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={profitSplitChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                    className="text-xs text-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "Procent (%)", angle: -90, position: "insideLeft" }}
                    domain={[0, 100]}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="glass-panel border border-border/60 p-3">
                            <p className="font-semibold text-foreground">{data.name}</p>
                            <p className="text-sm text-foreground">
                              {typeof payload[0].value === 'number' ? `${payload[0].value.toFixed(1)}%` : payload[0].value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="split" radius={[8, 8, 0, 0]} fill="hsl(var(--primary))">
                    {profitSplitChartData.map((entry) => (
                      <Cell key={entry.name} fill={resolveColorByName(entry.name)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Plan-by-Plan Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Szczegółowy Podział Według Planów</CardTitle>
          <CardDescription>
            Warunki wypłat dla poszczególnych planów
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {payoutData.map((data, _idx) => (
              <div key={data.companyId} className="space-y-3">
                <h4 className="font-semibold">{data.companyName}</h4>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Plan</th>
                        <th>Podział Zysku</th>
                        <th>Pierwsza Wypłata</th>
                        <th>Cykl</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.plans.map((plan, planIdx) => (
                        <tr key={planIdx}>
                          <td>{plan.name}</td>
                          <td className="font-semibold">
                            {plan.profitSplit || "-"}
                          </td>
                          <td>
                            {plan.firstPayoutDays ? `${plan.firstPayoutDays} dni` : "-"}
                          </td>
                          <td>
                            {plan.cycleDays ? `${plan.cycleDays} dni` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

