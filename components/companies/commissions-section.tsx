"use client";

import { useMemo } from "react";
import { Receipt, BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CommissionCard } from "@/components/companies/accordion-item-client";
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
} from "recharts";
import { useFadeIn } from "@/lib/animations";
import type { CompanyCommission } from "@/lib/types";

interface CommissionsSectionProps {
  commissions: CompanyCommission[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--emerald-500))",
  "hsl(var(--blue-500))",
  "hsl(var(--amber-500))",
  "hsl(var(--rose-500))",
];

// Helper to extract numeric value from commission string
function extractNumericValue(value: string): number | null {
  const match = value.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

export function CommissionsSection({ commissions }: CommissionsSectionProps) {
  const sectionAnim = useFadeIn({ threshold: 0.1 });

  const stats = useMemo(() => {
    const numericValues = commissions
      .map((c) => extractNumericValue(c.value))
      .filter((v): v is number => v !== null);

    if (numericValues.length === 0) {
      return {
        average: null,
        min: null,
        max: null,
        count: commissions.length,
      };
    }

    return {
      average: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
      count: commissions.length,
    };
  }, [commissions]);

  const barChartData = useMemo(() => {
    return commissions
      .map((commission) => {
        const numericValue = extractNumericValue(commission.value);
        return {
          name: commission.market.length > 12 ? `${commission.market.substring(0, 12)}...` : commission.market,
          fullName: commission.market,
          value: numericValue ?? 0,
          formattedValue: commission.value,
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [commissions]);

  if (commissions.length === 0) {
    return null;
  }

  return (
    <div ref={sectionAnim.ref} className={`space-y-6 ${sectionAnim.className}`}>
      {/* Quick Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Liczba rynków</p>
              <p className="text-2xl font-semibold">{stats.count}</p>
            </div>
          </CardContent>
        </Card>
        {stats.average !== null && (
          <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
            <CardContent className="pt-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Średnia prowizja</p>
                <p className="text-2xl font-semibold">{stats.average.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {stats.min !== null && (
          <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
            <CardContent className="pt-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Najniższa</p>
                <p className="text-2xl font-semibold">{stats.min.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {stats.max !== null && (
          <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
            <CardContent className="pt-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Najwyższa</p>
                <p className="text-2xl font-semibold">{stats.max.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comparison Chart */}
      {barChartData.length > 0 && (
        <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" />
              Porównanie prowizji
            </CardTitle>
            <CardDescription className="text-xs">
              Wizualizacja prowizji dla różnych rynków
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Prowizja",
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
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Commission Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {commissions.map((commission) => (
          <CommissionCard
            key={`${commission.market}-${commission.value}`}
            market={commission.market}
            value={commission.value}
            notes={commission.notes}
          />
        ))}
      </div>
    </div>
  );
}

