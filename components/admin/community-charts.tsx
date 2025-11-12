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
  CommunityTimeSeriesPoint,
  StatusDistribution,
  TopInfluencer,
} from "@/lib/queries/community-stats";

interface CommunityChartsProps {
  timeSeries: CommunityTimeSeriesPoint[];
  statusDistribution: StatusDistribution[];
  topInfluencers: TopInfluencer[];
}

const chartConfig = {
  influencers: {
    label: "Influencerzy",
    color: "hsl(var(--primary))",
  },
  reviews: {
    label: "Opinie",
    color: "hsl(var(--accent))",
  },
  issues: {
    label: "Błędy danych",
    color: "hsl(var(--destructive))",
  },
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--emerald-500))",
  "hsl(var(--yellow-500))",
  "hsl(var(--destructive))",
  "hsl(var(--blue-500))",
  "hsl(var(--purple-500))",
  "hsl(var(--pink-500))",
  "hsl(var(--orange-500))",
];

export function CommunityCharts({
  timeSeries,
  statusDistribution,
  topInfluencers,
}: CommunityChartsProps) {
  const pieData = statusDistribution.map((item) => ({
    name: item.status,
    value: item.count,
    percentage: item.percentage,
  }));

  const barData = topInfluencers.slice(0, 5).map((item) => ({
    name: item.handle.length > 15 ? item.handle.substring(0, 15) + "..." : item.handle,
    platform: item.platform,
    audienceSize: item.audienceSize,
  }));

  return (
    <div className="space-y-6">
      {/* Trend aktywności w czasie */}
      <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle>Trend aktywności społecznościowej</CardTitle>
          <CardDescription>
            Liczba zgłoszeń influencerów, opinii i błędów danych w ostatnich 30 dniach
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
                  type="monotone"
                  dataKey="influencers"
                  stroke="var(--color-influencers)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Influencerzy"
                />
                <Line
                  type="monotone"
                  dataKey="reviews"
                  stroke="var(--color-reviews)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Opinie"
                />
                <Line
                  type="monotone"
                  dataKey="issues"
                  stroke="var(--color-issues)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Błędy danych"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rozkład statusów */}
        <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle>Rozkład statusów</CardTitle>
            <CardDescription>
              Procentowy rozkład wszystkich operacji społecznościowych według statusu
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
                        fill={COLORS[index % COLORS.length]}
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

        {/* Top influencerzy */}
        <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle>Top Influencerzy</CardTitle>
            <CardDescription>
              Influencerzy z największym zasięgiem
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
                    dataKey="audienceSize"
                    fill="var(--color-influencers)"
                    radius={[4, 4, 0, 0]}
                    name="Zasięg"
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

