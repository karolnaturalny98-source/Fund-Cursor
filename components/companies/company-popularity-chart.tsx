"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { useFadeIn } from "@/lib/animations";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompanyRankingHistory } from "@/lib/types";

interface CompanyPopularityChartProps {
  rankingHistory: CompanyRankingHistory[];
  companyName: string;
}

interface ChartDataPoint {
  date: string;
  score: number;
  formattedDate: string;
}

export function CompanyPopularityChart({
  rankingHistory,
  companyName,
}: CompanyPopularityChartProps) {
  const chartAnim = useFadeIn({ rootMargin: "-50px" });
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (rankingHistory.length === 0) {
      return [];
    }

    return rankingHistory.map((item) => {
      const date = new Date(item.recordedAt);
      const formattedDate = date.toLocaleDateString("pl-PL", {
        month: "short",
        day: "numeric",
      });

      return {
        date: item.recordedAt,
        score: item.overallScore,
        formattedDate,
      };
    });
  }, [rankingHistory]);

  if (chartData.length === 0) {
    return (
      <Card ref={chartAnim.ref} className={`rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm ${chartAnim.className}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-semibold sm:text-2xl">
              Popularność
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Wykres pokazujący zmianę ogólnego score&apos;u w czasie.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border/40 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Brak danych historycznych do wyświetlenia.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const minScore = Math.min(...chartData.map((d) => d.score));
  const maxScore = Math.max(...chartData.map((d) => d.score));
  const domain = [
    Math.max(0, Math.floor(minScore - (maxScore - minScore) * 0.1)),
    Math.ceil(maxScore + (maxScore - minScore) * 0.1),
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataPoint }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      const date = new Date(data.date).toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return (
        <div className="rounded-lg border border-border/40 bg-[rgba(8,10,13,0.82)] px-3 py-2 shadow-lg !backdrop-blur-[36px]">
          <p className="text-xs font-medium text-muted-foreground">{date}</p>
          <p className="text-sm font-semibold text-foreground">
            Score: {data.score.toFixed(1)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card ref={chartAnim.ref} className={`rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm ${chartAnim.className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-semibold sm:text-2xl">
            Popularność
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Wykres pokazujący zmianę ogólnego score&apos;u {companyName} w czasie.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="formattedDate"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={domain}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#scoreGradient)"
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

