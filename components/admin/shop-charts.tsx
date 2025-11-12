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
} from "recharts";
import type { ShopTopCompany, ShopTopPlan } from "@/lib/queries/shop";

interface ShopChartsProps {
  topCompanies: ShopTopCompany[];
  topPlans: ShopTopPlan[];
}

const chartConfig = {
  orderCount: {
    label: "Liczba zamówień",
    color: "hsl(var(--primary))",
  },
  revenue: {
    label: "Revenue ($)",
    color: "hsl(var(--accent))",
  },
};

export function ShopCharts({ topCompanies, topPlans }: ShopChartsProps) {
  const companiesData = topCompanies.slice(0, 5).map((item) => ({
    name: item.companyName,
    orderCount: item.orderCount,
    revenue: item.revenue,
  }));

  const plansData = topPlans.slice(0, 5).map((item) => ({
    name: item.planName,
    orderCount: item.orderCount,
    revenue: item.revenue,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
        <CardHeader>
          <CardTitle>Top Firmy</CardTitle>
          <CardDescription>
            Najpopularniejsze firmy według liczby zamówień
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={companiesData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-muted-foreground"
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
              />
              <Bar
                dataKey="orderCount"
                fill="var(--color-orderCount)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
        <CardHeader>
          <CardTitle>Top Plany</CardTitle>
          <CardDescription>
            Najpopularniejsze plany według liczby zamówień
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={plansData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-muted-foreground"
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
              />
              <Bar
                dataKey="orderCount"
                fill="var(--color-orderCount)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
