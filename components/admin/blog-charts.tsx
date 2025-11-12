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
  BlogTimeSeriesPoint,
  StatusDistribution,
  TopBlogCategory,
  TopBlogAuthor,
} from "@/lib/queries/blog-stats";

interface BlogChartsProps {
  timeSeries: BlogTimeSeriesPoint[];
  statusDistribution: StatusDistribution[];
  topCategories: TopBlogCategory[];
  topAuthors: TopBlogAuthor[];
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
  DRAFT: "hsl(var(--yellow-500))",
  PUBLISHED: "hsl(var(--emerald-500))",
  ARCHIVED: "hsl(var(--muted-foreground))",
};

export function BlogCharts({
  timeSeries,
  statusDistribution,
  topCategories,
  topAuthors,
}: BlogChartsProps) {
  const statusPieData = statusDistribution.map((item) => ({
    name: item.status,
    value: item.count,
    percentage: item.percentage,
  }));

  const topCategoriesBarData = topCategories.map((item) => ({
    name: item.categoryName.length > 20 ? item.categoryName.substring(0, 20) + "..." : item.categoryName,
    slug: item.categorySlug,
    postsCount: item.postsCount,
  }));

  const topAuthorsBarData = topAuthors.map((item) => ({
    name: item.authorName.length > 20 ? item.authorName.substring(0, 20) + "..." : item.authorName,
    email: item.authorEmail,
    postsCount: item.postsCount,
  }));

  const timeSeriesConfig = {
    created: {
      label: "Utworzone",
      color: "hsl(var(--primary))",
    },
    published: {
      label: "Opublikowane",
      color: "hsl(var(--emerald-500))",
    },
  };

  const topCategoriesConfig = {
    postsCount: {
      label: "Liczba artykułów",
      color: "hsl(var(--primary))",
    },
  };

  const topAuthorsConfig = {
    postsCount: {
      label: "Liczba artykułów",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Line Chart: Blog Trends */}
      <Card className="rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
        <CardHeader>
          <CardTitle>Trendy artykułów w czasie</CardTitle>
          <CardDescription>
            Liczba utworzonych i opublikowanych artykułów w ostatnich 30 dniach.
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
                  dataKey="created"
                  stroke="var(--color-created)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Utworzone"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="published"
                  stroke="var(--color-published)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Opublikowane"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart: Status Distribution */}
        <Card className="rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
          <CardHeader>
            <CardTitle>Rozkład statusów artykułów</CardTitle>
            <CardDescription>Rozkład artykułów według statusu.</CardDescription>
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

        {/* Bar Chart: Top Categories */}
        <Card className="rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
          <CardHeader>
            <CardTitle>Top kategorie</CardTitle>
            <CardDescription>Kategorie z największą liczbą artykułów.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={topCategoriesConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCategoriesBarData} layout="vertical" margin={{ left: 0, right: 0 }}>
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
                  <Bar dataKey="postsCount" fill="var(--color-postsCount)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart: Top Authors */}
      <Card className="rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
        <CardHeader>
          <CardTitle>Top autorzy</CardTitle>
          <CardDescription>Autorzy z największą liczbą artykułów.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={topAuthorsConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topAuthorsBarData} layout="vertical" margin={{ left: 0, right: 0 }}>
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
                <Bar dataKey="postsCount" fill="var(--color-postsCount)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

