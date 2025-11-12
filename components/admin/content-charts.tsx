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
  ContentTimeSeriesPoint,
  StatusDistribution,
  TopCompany,
} from "@/lib/queries/content-stats";

interface ContentChartsProps {
  timeSeries: ContentTimeSeriesPoint[];
  statusDistribution: {
    companies: StatusDistribution[];
    plans: StatusDistribution[];
  };
  topCompanies: TopCompany[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--emerald-500))",
  "hsl(var(--yellow-500))",
  "hsl(var(--destructive))",
  "hsl(var(--blue-500))",
];

const timeSeriesConfig = {
  companies: {
    label: "Firmy",
    color: "hsl(var(--primary))",
  },
  plans: {
    label: "Plany",
    color: "hsl(var(--accent))",
  },
  faqs: {
    label: "FAQ",
    color: "hsl(var(--emerald-500))",
  },
};

const topCompaniesConfig = {
  plansCount: {
    label: "Liczba planów",
    color: "hsl(var(--primary))",
  },
  faqsCount: {
    label: "Liczba FAQ",
    color: "hsl(var(--accent))",
  },
};

export function ContentCharts({
  timeSeries,
  statusDistribution,
  topCompanies,
}: ContentChartsProps) {
  const companyDistributionPieData = statusDistribution.companies.map((item) => ({
    name: item.status,
    value: item.count,
    percentage: item.percentage,
  }));

  const planDistributionPieData = statusDistribution.plans.map((item) => ({
    name: item.status === "instant-funding"
      ? "Instant funding"
      : item.status === "one-step"
      ? "1-etapowe"
      : item.status === "two-step"
      ? "2-etapowe"
      : item.status,
    value: item.count,
    percentage: item.percentage,
  }));

  const topCompaniesBarData = topCompanies.map((item) => ({
    name: item.companyName.length > 20
      ? item.companyName.substring(0, 20) + "..."
      : item.companyName,
    companySlug: item.companySlug,
    plansCount: item.plansCount,
    faqsCount: item.faqsCount,
  }));

  return (
    <div className="space-y-6">
      {/* Line Chart: Content Trends */}
      <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle>Aktywność treści w czasie</CardTitle>
          <CardDescription>
            Liczba dodanych firm, planów i FAQ w ostatnich 30 dniach.
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
                  dataKey="companies"
                  stroke="var(--color-companies)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Firmy"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="plans"
                  stroke="var(--color-plans)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Plany"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="faqs"
                  stroke="var(--color-faqs)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="FAQ"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart: Company Distribution by Country */}
        <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle>Rozkład firm według kraju</CardTitle>
            <CardDescription>Rozkład firm według kraju pochodzenia.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[250px]">
            <ChartContainer config={{}} className="aspect-square h-full">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="name" hideLabel />}
                />
                <Pie
                  data={companyDistributionPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  strokeWidth={2}
                  cornerRadius={5}
                  paddingAngle={5}
                >
                  {companyDistributionPieData.map((entry, index) => (
                    <Cell
                      key={`cell-company-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: Plan Distribution by Model */}
        <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle>Rozkład planów według modelu</CardTitle>
            <CardDescription>Rozkład planów według modelu wyzwania.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[250px]">
            <ChartContainer config={{}} className="aspect-square h-full">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="name" hideLabel />}
                />
                <Pie
                  data={planDistributionPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  strokeWidth={2}
                  cornerRadius={5}
                  paddingAngle={5}
                >
                  {planDistributionPieData.map((entry, index) => (
                    <Cell
                      key={`cell-plan-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart: Top Companies */}
      <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle>Top Firmy</CardTitle>
          <CardDescription>Firmy z największą liczbą planów i FAQ.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={topCompaniesConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCompaniesBarData} margin={{ left: 0, right: 0 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  className="text-muted-foreground text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-muted-foreground"
                />
                <ChartTooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                  content={<ChartTooltipContent />}
                />
                <Legend />
                <Bar dataKey="plansCount" fill="var(--color-plansCount)" radius={[4, 4, 0, 0]} name="Plany" />
                <Bar dataKey="faqsCount" fill="var(--color-faqsCount)" radius={[4, 4, 0, 0]} name="FAQ" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

