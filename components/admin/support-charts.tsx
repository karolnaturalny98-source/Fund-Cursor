"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type {
  SupportTimeSeriesPoint,
  StatusDistribution,
  TopDisputedCompany,
} from "@/lib/queries/support-stats";

interface SupportChartsProps {
  timeSeries: SupportTimeSeriesPoint[];
  statusDistribution: StatusDistribution[];
  topCompanies: TopDisputedCompany[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--emerald-500))",
  "hsl(var(--yellow-500))",
  "hsl(var(--destructive))",
  "hsl(var(--blue-500))",
];

const STATUS_COLOR_MAP: Record<string, string> = {
  OPEN: "hsl(var(--primary))",
  IN_REVIEW: "hsl(var(--yellow-500))",
  WAITING_USER: "hsl(var(--blue-500))",
  RESOLVED: "hsl(var(--emerald-500))",
  REJECTED: "hsl(var(--destructive))",
};

export function SupportCharts({
  timeSeries,
  statusDistribution,
  topCompanies,
}: SupportChartsProps) {
  const statusPieData = statusDistribution.map((item) => ({
    name: item.status,
    value: item.count,
    percentage: item.percentage,
  }));

  const topCompaniesBarData = topCompanies.map((item) => ({
    name: item.companyName.length > 20 ? item.companyName.substring(0, 20) + "..." : item.companyName,
    slug: item.companySlug,
    disputesCount: item.disputesCount,
  }));

  const timeSeriesConfig = {
    disputes: {
      label: "Nowe spory",
      color: "hsl(var(--primary))",
    },
    resolved: {
      label: "Rozwiązane",
      color: "hsl(var(--emerald-500))",
    },
  };

  const topCompaniesConfig = {
    disputesCount: {
      label: "Liczba sporów",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Line Chart: Support Trends */}
      <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle>Trendy sporów w czasie</CardTitle>
          <CardDescription>
            Liczba nowych sporów i rozwiązanych w ostatnich 30 dniach.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={timeSeriesConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-muted-foreground"
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-muted-foreground"
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="disputes"
                  stroke="var(--color-disputes)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Nowe spory"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="resolved"
                  stroke="var(--color-resolved)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Rozwiązane"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart: Status Distribution */}
        <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle>Rozkład statusów sporów</CardTitle>
            <CardDescription>Rozkład sporów według statusu.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[300px]">
            <ChartContainer config={{}} className="aspect-square h-full">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="name" hideLabel />}
                />
                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  strokeWidth={2}
                  cornerRadius={5}
                  paddingAngle={5}
                >
                  {statusPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLOR_MAP[entry.name] || CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar Chart: Top Disputed Companies */}
        <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle>Top firmy ze sporami</CardTitle>
            <CardDescription>Firmy z największą liczbą sporów.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={topCompaniesConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCompaniesBarData} layout="vertical" margin={{ left: 0, right: 0 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-muted-foreground"
                    width={100}
                  />
                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="disputesCount" fill="var(--color-disputesCount)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

