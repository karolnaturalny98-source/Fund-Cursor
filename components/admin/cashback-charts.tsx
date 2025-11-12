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
  TransactionTimeSeriesPoint,
  StatusDistribution,
  TopCompany,
} from "@/lib/queries/cashback-stats";

interface CashbackChartsProps {
  timeSeries: TransactionTimeSeriesPoint[];
  statusDistribution: StatusDistribution[];
  topCompanies: TopCompany[];
}

const chartConfig = {
  transactions: {
    label: "Transakcje",
    color: "hsl(var(--primary))",
  },
  points: {
    label: "Punkty",
    color: "hsl(var(--accent))",
  },
};

const STATUS_COLORS = {
  PENDING: "hsl(var(--warning))",
  APPROVED: "hsl(var(--emerald-500))",
  REDEEMED: "hsl(var(--primary))",
  REJECTED: "hsl(var(--destructive))",
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--emerald-500))",
  "hsl(var(--yellow-500))",
  "hsl(var(--destructive))",
];

export function CashbackCharts({
  timeSeries,
  statusDistribution,
  topCompanies,
}: CashbackChartsProps) {
  const pieData = statusDistribution.map((item) => ({
    name: item.status,
    value: item.count,
    percentage: item.percentage,
  }));

  const barData = topCompanies.slice(0, 5).map((item) => ({
    name: item.companyName.length > 15 ? item.companyName.substring(0, 15) + "..." : item.companyName,
    transactions: item.transactionCount,
    points: item.totalPoints,
  }));

  return (
    <div className="space-y-6">
      {/* Trend transakcji w czasie */}
      <Card className="rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
        <CardHeader>
          <CardTitle>Trend transakcji w czasie</CardTitle>
          <CardDescription>
            Liczba transakcji i punktów w ostatnich 30 dniach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
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
                <YAxis
                  yAxisId="right"
                  orientation="right"
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
                  dataKey="transactions"
                  stroke="var(--color-transactions)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Transakcje"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="points"
                  stroke="var(--color-points)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Punkty"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rozkład statusów */}
        <Card className="rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
          <CardHeader>
            <CardTitle>Rozkład statusów</CardTitle>
            <CardDescription>
              Procentowy rozkład transakcji według statusu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) =>
                      `${name}: ${percentage.toFixed(1)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] ||
                          COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top firmy */}
        <Card className="rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
          <CardHeader>
            <CardTitle>Top Firmy</CardTitle>
            <CardDescription>
              Najpopularniejsze firmy według liczby transakcji
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
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
                  <Legend />
                  <Bar
                    dataKey="transactions"
                    fill="var(--color-transactions)"
                    radius={[4, 4, 0, 0]}
                    name="Transakcje"
                  />
                  <Bar
                    dataKey="points"
                    fill="var(--color-points)"
                    radius={[4, 4, 0, 0]}
                    name="Punkty"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

