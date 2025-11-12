"use client";

import { useMemo, useState } from "react";
import { Gauge, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useFadeIn, useScrollAnimation, useStaggerAnimation } from "@/lib/animations";
import type { CompanyLeverageTier } from "@/lib/types";

interface LeverageTiersCardProps {
  tiers: CompanyLeverageTier[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--emerald-500))",
  "hsl(var(--blue-500))",
  "hsl(var(--amber-500))",
  "hsl(var(--rose-500))",
];

export function LeverageTiersCard({ tiers }: LeverageTiersCardProps) {
  const [sortBy, setSortBy] = useState<"leverage" | "accountSize">("leverage");
  const sectionAnim = useFadeIn({ threshold: 0.1 });
  const sectionScrollAnim = useScrollAnimation({ threshold: 0.1 });
  const staggerItems = useStaggerAnimation(tiers.length, 50);

  const sortedTiers = useMemo(() => {
    const sorted = [...tiers].sort((a, b) => {
      if (sortBy === "leverage") {
        const aLev = a.maxLeverage ?? 0;
        const bLev = b.maxLeverage ?? 0;
        return bLev - aLev;
      } else {
        // Sort by account size (simple string comparison)
        const aSize = a.accountSize ?? "";
        const bSize = b.accountSize ?? "";
        return aSize.localeCompare(bSize);
      }
    });
    return sorted;
  }, [tiers, sortBy]);

  const maxLeverage = useMemo(() => {
    return Math.max(...tiers.map((t) => t.maxLeverage ?? 0), 1);
  }, [tiers]);

  const barChartData = useMemo(() => {
    return sortedTiers
      .filter((t) => t.maxLeverage !== null)
      .map((tier) => ({
        name: tier.label.length > 12 ? `${tier.label.substring(0, 12)}...` : tier.label,
        fullName: tier.label,
        leverage: tier.maxLeverage ?? 0,
        formattedLeverage: `1:${tier.maxLeverage}`,
        accountSize: tier.accountSize ?? "N/A",
      }));
  }, [sortedTiers]);

  const visibleStaggerItems = sectionScrollAnim.isVisible ? staggerItems : new Array(tiers.length).fill(true);

  if (tiers.length === 0) {
    return null;
  }

  return (
    <div ref={(node) => {
      sectionAnim.ref.current = node;
      sectionScrollAnim.ref.current = node;
    }} className={`space-y-6 ${sectionAnim.className}`}>
      {/* Quick Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Liczba tierów</p>
              <p className="text-2xl font-semibold">{tiers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Max dźwignia</p>
              <p className="text-2xl font-semibold">1:{maxLeverage}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Sortowanie</p>
              <div className="flex gap-1">
                <Button
                  variant={sortBy === "leverage" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("leverage")}
                  className="h-7 rounded-full px-2.5 text-[11px] font-normal"
                >
                  Dźwignia
                </Button>
                <Button
                  variant={sortBy === "accountSize" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("accountSize")}
                  className="h-7 rounded-full px-2.5 text-[11px] font-normal"
                >
                  Rozmiar konta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      {barChartData.length > 0 && (
        <Card className="rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" />
              Porównanie dźwigni
            </CardTitle>
            <CardDescription className="text-xs">
              Wizualizacja maksymalnej dźwigni dla każdego tieru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                leverage: {
                  label: "Dźwignia",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="leverage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Leverage Tier Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sortedTiers.map((tier, index) => {
          const leverage = tier.maxLeverage ?? 0;
          const leveragePercent = maxLeverage > 0 ? (leverage / maxLeverage) * 100 : 0;
          const itemAnim = visibleStaggerItems[index] || false;

          return (
            <Card
              key={`${tier.label}-${tier.accountSize ?? "default"}`}
              className={`rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md ${
                itemAnim ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{
                transitionDelay: `${index * 50}ms`,
                transitionDuration: "300ms",
              }}
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold">{tier.label}</CardTitle>
                  <Badge variant="outline" className="shrink-0 text-xs font-semibold">
                    {leverage > 0 ? `1:${leverage}` : "?"}
                  </Badge>
                </div>
                
                {/* Progress bar for leverage */}
                {leverage > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Poziom dźwigni</span>
                      <span className="font-medium text-foreground">{leveragePercent.toFixed(0)}%</span>
                    </div>
                    <Progress value={leveragePercent} className="h-2" />
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-2 pt-0">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Rozmiar konta:</span>
                    <span className="font-medium text-foreground">{tier.accountSize ?? "N/A"}</span>
                  </div>
                  {tier.notes && (
                    <div className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] p-2 text-xs text-muted-foreground">
                      {tier.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

