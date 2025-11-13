"use client";

import { useMemo } from "react";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
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
  Legend,
} from "recharts";
import { useFadeIn } from "@/lib/animations";
import { formatCurrencyLocalized } from "@/lib/currency";

interface PlanWithComputed {
  id: string;
  name: string;
  price: number;
  convertedPrice: number;
  formattedPrice: string;
  evaluationModel: string;
  currency: string;
}

interface OffersComparisonChartProps {
  plans: PlanWithComputed[];
  currency: string;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--emerald-500))",
  "hsl(var(--blue-500))",
  "hsl(var(--amber-500))",
  "hsl(var(--rose-500))",
  "hsl(var(--purple-500))",
];

function renderModelLabel(model: string) {
  switch (model) {
    case "one-step":
      return "1-etapowe";
    case "two-step":
      return "2-etapowe";
    case "instant-funding":
      return "Instant";
    default:
      return model;
  }
}

export function OffersComparisonChart({ plans, currency }: OffersComparisonChartProps) {
  const chartAnim = useFadeIn({ rootMargin: "-50px" });

  const barChartData = useMemo(() => {
    return plans
      .sort((a, b) => b.convertedPrice - a.convertedPrice)
      .slice(0, 10)
      .map((plan) => ({
        name: plan.name.length > 15 ? `${plan.name.substring(0, 15)}...` : plan.name,
        fullName: plan.name,
        price: plan.convertedPrice,
        formattedPrice: plan.formattedPrice,
      }));
  }, [plans]);

  const pieChartData = useMemo(() => {
    const modelCounts = plans.reduce((acc, plan) => {
      const model = renderModelLabel(plan.evaluationModel);
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(modelCounts).map(([name, value], index) => ({
      name,
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [plans]);

  if (plans.length === 0) {
    return null;
  }

  return (
    <div ref={chartAnim.ref} className={`space-y-6 ${chartAnim.className}`}>
      {/* Bar Chart - Price Comparison */}
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Porównanie cen planów</CardTitle>
          </div>
          <CardDescription className="text-sm">
            Top 10 planów według ceny (w {currency})
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
              <BarChart data={barChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => formatCurrencyLocalized(value, currency as "USD" | "EUR" | "PLN" | "CZK" | "GBP")}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border/60 bg-card/82 backdrop-blur-[36px]! p-3 shadow-md">
                          <p className="font-semibold text-foreground">{data.fullName}</p>
                          <p className="text-sm text-primary">
                            {data.formattedPrice}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="price" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Pie Chart - Model Distribution */}
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Rozkład planów po modelach</CardTitle>
          </div>
          <CardDescription className="text-sm">
            Liczba planów według modelu oceny
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={pieChartData.reduce((acc, item, _index) => {
              acc[item.name] = {
                label: item.name,
                color: item.fill,
              };
              return acc;
            }, {} as Record<string, { label: string; color: string }>)}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="rounded-lg border border-border/60 bg-card/82 backdrop-blur-[36px]! p-3 shadow-md">
                          <p className="font-semibold text-foreground">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.value} {data.value === 1 ? "plan" : "plany"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

