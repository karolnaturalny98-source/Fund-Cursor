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
    <div className="space-y-[clamp(1.5rem,2.2vw,2.25rem)]">
      <div className="space-y-[clamp(0.6rem,0.9vw,0.85rem)]">
        <h2 className="fluid-h2 font-bold">Analiza Wypłat</h2>
        <p className="fluid-copy text-muted-foreground">
          Szczegółowe porównanie warunków wypłat i podziału zysków
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] sm:grid-cols-2 lg:grid-cols-3">
        {payoutData.map((data, idx) => (
          <Card
            key={data.companyId}
            className="border-l-4 bg-card/82 border-[var(--border-color)]"
            style={{ "--border-color": getCompareColor(idx) } as React.CSSProperties}
          >
            <CardHeader className="pb-[clamp(0.75rem,1.1vw,1rem)]">
              <CardTitle className="text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
                {data.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
              {data.payoutFrequency && (
                <div className="flex items-center justify-between gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                  <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                    <Calendar className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                    Częstotliwość
                  </div>
                  <Badge variant="secondary" className="fluid-badge font-semibold">
                    {data.payoutFrequency}
                  </Badge>
                </div>
              )}

              {data.minFirstPayoutDays !== null && (
                <div className="flex items-center justify-between gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                  <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                    <TrendingUp className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                    Pierwsza wypłata
                  </div>
                  <span className="text-[clamp(1.1rem,0.5vw+1rem,1.35rem)] font-bold text-foreground">
                    {data.minFirstPayoutDays} dni
                  </span>
                </div>
              )}

              {data.avgCycleDays !== null && (
                <div className="flex items-center justify-between gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                  <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                    <Calendar className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                    Cykl wypłat
                  </div>
                  <span className="text-[clamp(1.1rem,0.5vw+1rem,1.35rem)] font-bold text-foreground">
                    {data.avgCycleDays.toFixed(0)} dni
                  </span>
                </div>
              )}

              {data.bestProfitSplit !== null && (
                <div className="flex items-center justify-between gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                  <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                    <Percent className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                    Najlepszy podział
                  </div>
                  <span className="text-[clamp(1.1rem,0.5vw+1rem,1.35rem)] font-bold text-primary">
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
        <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle className="text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
              Czas do Pierwszej Wypłaty
            </CardTitle>
            <CardDescription className="fluid-caption">
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
                    className="fluid-caption text-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="fluid-caption text-muted-foreground"
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
        <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle className="text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
              Porównanie Podziału Zysku
            </CardTitle>
            <CardDescription className="fluid-caption">
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
                    className="fluid-caption text-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="fluid-caption text-muted-foreground"
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
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle className="text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
            Szczegółowy Podział Według Planów
          </CardTitle>
          <CardDescription className="fluid-caption">
            Warunki wypłat dla poszczególnych planów
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-[clamp(1rem,1.6vw,1.5rem)]">
            {payoutData.map((data, _idx) => (
              <div key={data.companyId} className="space-y-[clamp(0.6rem,0.9vw,0.85rem)]">
                <h4 className="text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold text-foreground">
                  {data.companyName}
                </h4>
                <div className="overflow-x-auto">
                  <table className="data-table text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)]">
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
                          <td className="font-medium text-foreground">{plan.name}</td>
                          <td className="font-semibold text-foreground">
                            {plan.profitSplit || "-"}
                          </td>
                          <td className="text-muted-foreground">
                            {plan.firstPayoutDays ? `${plan.firstPayoutDays} dni` : "-"}
                          </td>
                          <td className="text-muted-foreground">
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

