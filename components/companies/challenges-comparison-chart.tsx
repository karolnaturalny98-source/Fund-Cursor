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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useFadeIn } from "@/lib/animations";
import type { CompanyPlan } from "@/lib/types";
import { useCurrency } from "@/app/providers/currency-client-provider";
import { convertCurrency, formatCurrencyLocalized } from "@/lib/currency";

interface ChallengesComparisonChartProps {
  plans: CompanyPlan[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--emerald-500))",
  "hsl(var(--blue-500))",
  "hsl(var(--purple-500))",
  "hsl(var(--amber-500))",
  "hsl(var(--indigo-500))",
];

function parseProfitSplit(split: string | null | undefined): number {
  if (!split) return 0;
  const match = /^(\d{1,3})/.exec(split);
  if (!match) return 0;
  return Number.parseInt(match[1], 10) || 0;
}

export function ChallengesComparisonChart({ plans }: ChallengesComparisonChartProps) {
  const chartAnim = useFadeIn({ rootMargin: "-100px" });
  const { currency, rates } = useCurrency();

  const priceData = useMemo(() => {
    return plans.map((plan, index) => ({
      name: plan.name.length > 12 ? plan.name.substring(0, 12) + "..." : plan.name,
      fullName: plan.name,
      price: convertCurrency(plan.price, plan.currency, currency, rates),
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [plans, currency, rates]);

  const segmentData = useMemo(() => {
    const segments = {
      instant: 0,
      "one-step": 0,
      "two-step": 0,
    };

    plans.forEach((plan) => {
      if (plan.evaluationModel === "instant-funding") {
        segments.instant++;
      } else if (plan.evaluationModel === "one-step") {
        segments["one-step"]++;
      } else if (plan.evaluationModel === "two-step") {
        segments["two-step"]++;
      }
    });

    return [
      { name: "Instant funding", value: segments.instant, color: CHART_COLORS[1] },
      { name: "1-etapowe", value: segments["one-step"], color: CHART_COLORS[2] },
      { name: "2-etapowe", value: segments["two-step"], color: CHART_COLORS[3] },
    ].filter((item) => item.value > 0);
  }, [plans]);

  const radarData = useMemo(() => {
    if (plans.length === 0) return { planData: [], radarDataPoints: [] };

    const topPlans = plans.slice(0, 5);
    const maxPrice = Math.max(...plans.map((p) => convertCurrency(p.price, p.currency, currency, rates)));
    const maxProfitSplit = Math.max(...plans.map((p) => parseProfitSplit(p.profitSplit)));
    const maxDrawdown = Math.max(...plans.map((p) => p.maxDrawdown || 0));

    // Przygotuj dane dla każdego planu
    const planData = topPlans.map((plan, index) => {
      const price = convertCurrency(plan.price, plan.currency, currency, rates);
      const profitSplit = parseProfitSplit(plan.profitSplit);
      const drawdown = plan.maxDrawdown || 0;

      return {
        planName: plan.name.length > 10 ? plan.name.substring(0, 10) + "..." : plan.name,
        fullName: plan.name,
        Cena: maxPrice > 0 ? ((maxPrice - price) / maxPrice) * 100 : 0,
        "Profit Split": maxProfitSplit > 0 ? (profitSplit / maxProfitSplit) * 100 : 0,
        "Max Drawdown": maxDrawdown > 0 ? ((maxDrawdown - drawdown) / maxDrawdown) * 100 : 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    // Radar chart potrzebuje wspólnej struktury danych
    const categories = ["Cena", "Profit Split", "Max Drawdown"];
    const radarDataPoints = categories.map((category) => {
      const point: Record<string, string | number> = { category };
      planData.forEach((plan) => {
        point[plan.planName] = plan[category as keyof typeof plan] as number;
      });
      return point;
    });

    return { planData, radarDataPoints };
  }, [plans, currency, rates]);

  if (plans.length === 0) {
    return null;
  }

  return (
    <div ref={chartAnim.ref} className={`space-y-6 ${chartAnim.className}`}>
      {/* Bar Chart - Ceny planów */}
      {priceData.length > 0 && (
        <Card className="rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold sm:text-2xl">
                Porównanie cen planów
              </CardTitle>
            </div>
            <CardDescription>
              Wizualizacja cen wszystkich dostępnych planów w wybranej walucie.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                price: {
                  label: "Cena",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => formatCurrencyLocalized(value, currency)}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border/40 bg-[rgba(8,10,13,0.82)] px-3 py-2 shadow-lg !backdrop-blur-[36px]">
                            <p className="text-xs font-medium text-muted-foreground">{data.fullName}</p>
                            <p className="text-sm font-semibold text-foreground">
                              {formatCurrencyLocalized(data.price, currency)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="price" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Pie Chart - Rozkład segmentów */}
      {segmentData.length > 0 && (
        <Card className="rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold sm:text-2xl">
                Rozkład planów według segmentów
              </CardTitle>
            </div>
            <CardDescription>
              Procentowy rozkład planów między różnymi modelami wyzwań.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={segmentData.reduce((acc, item) => {
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
                    data={segmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {segmentData.map((entry, index) => (
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
                              {data.value} plan{data.value !== 1 ? "ów" : ""}
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

      {/* Radar Chart - Porównanie parametrów */}
      {radarData.planData && radarData.planData.length > 0 && (
        <Card className="rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold sm:text-2xl">
                Porównanie parametrów (Top 5)
              </CardTitle>
            </div>
            <CardDescription>
              Wizualizacja porównawcza kluczowych parametrów planów (normalizowane do 0-100%).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={radarData.planData.reduce((acc, item) => {
                acc[item.planName] = {
                  label: item.fullName,
                  color: item.color,
                };
                return acc;
              }, {} as Record<string, { label: string; color: string }>)}
              className="h-[400px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData.radarDataPoints}>
                  <PolarGrid stroke="hsl(var(--border))" opacity={0.3} />
                  <PolarAngleAxis
                    dataKey="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                  />
                  {radarData.planData.map((plan) => (
                    <Radar
                      key={plan.planName}
                      name={plan.fullName}
                      dataKey={plan.planName}
                      stroke={plan.color}
                      fill={plan.color}
                      fillOpacity={0.3}
                    />
                  ))}
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border/40 bg-[rgba(8,10,13,0.82)] px-3 py-2 shadow-lg !backdrop-blur-[36px]">
                            <p className="text-sm font-semibold text-foreground">{data.category}</p>
                            <div className="mt-2 space-y-1 text-xs">
                              {radarData.planData.map((plan) => (
                                <p key={plan.planName}>
                                  {plan.fullName}: {data[plan.planName]?.toFixed(1) || 0}%
                                </p>
                              ))}
                            </div>
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
      )}
    </div>
  );
}

