"use client";

import { useMemo } from "react";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
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
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useFadeIn } from "@/lib/animations";

interface Announcement {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  tag?: string;
}

interface AnnouncementsActivityChartProps {
  announcements: Announcement[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--emerald-500))",
  "hsl(var(--blue-500))",
  "hsl(var(--amber-500))",
  "hsl(var(--rose-500))",
  "hsl(var(--purple-500))",
];

export function AnnouncementsActivityChart({
  announcements,
}: AnnouncementsActivityChartProps) {
  const chartAnim = useFadeIn({ rootMargin: "-100px" });

  // Prepare timeline data (group by month)
  const timelineData = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    
    announcements.forEach((announcement) => {
      // Skip "Aktualne" as it's not a date
      if (announcement.dateLabel === "Aktualne") return;
      
      try {
        // Try to parse date from dateLabel (format: "DD.MM.YYYY")
        const [day, month, year] = announcement.dateLabel.split(".");
        if (day && month && year) {
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
        }
      } catch {
        // Ignore parsing errors
      }
    });

    return Object.entries(monthCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({
        month: month.split("-")[1] + "/" + month.split("-")[0],
        count,
      }));
  }, [announcements]);

  // Prepare tag distribution data
  const tagDistribution = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    
    announcements.forEach((announcement) => {
      const tag = announcement.tag || "Brak tagu";
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    return Object.entries(tagCounts)
      .map(([name, value], index) => ({
        name,
        value,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [announcements]);

  // Prepare activity by date label (bar chart)
  const activityByDateLabel = useMemo(() => {
    const labelCounts: Record<string, number> = {};
    
    announcements.forEach((announcement) => {
      const label = announcement.dateLabel;
      labelCounts[label] = (labelCounts[label] || 0) + 1;
    });

    return Object.entries(labelCounts)
      .map(([label, count]) => ({
        label: label === "Aktualne" ? "Aktualne" : label,
        count,
      }))
      .sort((a, b) => {
        if (a.label === "Aktualne") return -1;
        if (b.label === "Aktualne") return 1;
        return b.label.localeCompare(a.label);
      })
      .slice(0, 10); // Limit to top 10
  }, [announcements]);

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div ref={chartAnim.ref} className={`space-y-6 ${chartAnim.className}`}>
      {/* Pie Chart - Tag Distribution */}
      {tagDistribution.length > 0 && (
        <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold sm:text-2xl">
                Rozkład po tagach
              </CardTitle>
            </div>
            <CardDescription>
              Procentowy rozkład ogłoszeń według kategorii/tagów.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Liczba",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tagDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tagDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <ChartTooltipContent>
                            <div className="flex flex-col gap-1">
                              <p className="font-semibold">{payload[0].name}</p>
                              <p className="text-sm text-muted-foreground">
                                Liczba: {payload[0].value}
                              </p>
                            </div>
                          </ChartTooltipContent>
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
      )}

      {/* Bar Chart - Activity by Date Label */}
      {activityByDateLabel.length > 0 && (
        <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold sm:text-2xl">
                Aktywność według daty
              </CardTitle>
            </div>
            <CardDescription>
              Liczba ogłoszeń według etykiety daty.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Liczba ogłoszeń",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityByDateLabel}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <ChartTooltipContent>
                            <div className="flex flex-col gap-1">
                              <p className="font-semibold">{payload[0].payload.label}</p>
                              <p className="text-sm text-muted-foreground">
                                Liczba: {payload[0].value}
                              </p>
                            </div>
                          </ChartTooltipContent>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Line Chart - Timeline Activity */}
      {timelineData.length > 0 && (
        <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold sm:text-2xl">
                Aktywność w czasie
              </CardTitle>
            </div>
            <CardDescription>
              Trend aktywności ogłoszeń w poszczególnych miesiącach.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Liczba ogłoszeń",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <ChartTooltipContent>
                            <div className="flex flex-col gap-1">
                              <p className="font-semibold">{payload[0].payload.month}</p>
                              <p className="text-sm text-muted-foreground">
                                Liczba: {payload[0].value}
                              </p>
                            </div>
                          </ChartTooltipContent>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

