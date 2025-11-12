"use client";

import { useMemo } from "react";
import { TrendingUp, Star, Award, ArrowRight, Layers, MessageSquare, ShoppingCart, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { RiskAlertCard } from "@/components/companies/risk-alert-client";
import type { CompanyRankingHistory, Company } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RiskAlert {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  iconName: string;
}

interface OverviewHeroSectionProps {
  company: Company;
  rankingHistory: CompanyRankingHistory[];
  alerts: RiskAlert[];
  companySlug: string;
}

export function OverviewHeroSection({
  company,
  rankingHistory,
  alerts,
  companySlug,
}: OverviewHeroSectionProps) {
  const compactChartData = useMemo(() => {
    if (rankingHistory.length === 0) return null;

    const data = rankingHistory.map((item) => {
      const date = new Date(item.recordedAt);
      return {
        date: item.recordedAt,
        score: item.overallScore,
        formattedDate: date.toLocaleDateString("pl-PL", { month: "short", day: "numeric" }),
      };
    });

    const minScore = Math.min(...data.map((d) => d.score));
    const maxScore = Math.max(...data.map((d) => d.score));
    const domain = [
      Math.max(0, Math.floor(minScore - (maxScore - minScore) * 0.1)),
      Math.ceil(maxScore + (maxScore - minScore) * 0.1),
    ];

    return { data, domain };
  }, [rankingHistory]);

  const quickStats = useMemo(() => {
    const stats: Array<{ label: string; value: string; icon: React.ReactNode }> = [];

    if (company.rating) {
      stats.push({
        label: "Ocena",
        value: company.rating.toFixed(1),
        icon: <Star className="h-4 w-4 text-amber-400 fill-amber-400" />,
      });
    }

    if (company.cashbackRate) {
      stats.push({
        label: "Cashback",
        value: `${company.cashbackRate} pkt`,
        icon: <Award className="h-4 w-4 text-primary" />,
      });
    }

    return stats;
  }, [company.rating, company.cashbackRate]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Kolumna 1: Wykres compact + statystyki */}
      <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur-[36px]! transition-all hover:border-gradient-premium hover:shadow-premium-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Popularność</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {compactChartData ? (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={compactChartData.data}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="compactScoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={compactChartData.domain}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border/40 bg-card/82 px-2 py-1.5 text-xs shadow-lg">
                            <p className="font-semibold text-foreground">
                              Score: {data.score.toFixed(1)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#compactScoreGradient)"
                    dot={{ fill: "hsl(var(--primary))", r: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border/40 bg-muted/20">
              <p className="text-xs text-muted-foreground">Brak danych</p>
            </div>
          )}

          {quickStats.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2"
                >
                  {stat.icon}
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kolumna 2: Alerty ryzyka */}
      {alerts.length > 0 ? (
        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur-[36px]! transition-all hover:border-gradient-premium hover:shadow-premium-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg font-semibold">Alerty ryzyka</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Ważne informacje do rozważenia
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 2).map((alert) => (
              <RiskAlertCard key={alert.id} alert={alert} />
            ))}
            {alerts.length > 2 && (
              <p className="text-xs text-muted-foreground text-center">
                +{alerts.length - 2} więcej alertów poniżej
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur-[36px]!">
          <CardContent className="flex h-full items-center justify-center py-8">
            <div className="text-center">
              <PremiumIcon icon={Shield} variant="glow" size="lg" className="mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-foreground">Brak alertów</p>
              <p className="text-xs text-muted-foreground">Firma nie ma znanych ostrzeżeń</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kolumna 3: Quick actions */}
      <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur-[36px]! transition-all hover:border-gradient-premium hover:shadow-premium-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Szybkie linki</CardTitle>
          <p className="text-xs text-muted-foreground">
            Przejdź do innych sekcji
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            asChild
            variant="premium-outline"
            className="w-full justify-start gap-2 rounded-full"
          >
            <Link href={`#challenges`}>
              <PremiumIcon icon={Layers} variant="glow" size="sm" />
              Wyzwania
            </Link>
          </Button>
          <Button
            asChild
            variant="premium-outline"
            className="w-full justify-start gap-2 rounded-full"
          >
            <Link href={`#reviews`}>
              <PremiumIcon icon={MessageSquare} variant="glow" size="sm" />
              Opinie
            </Link>
          </Button>
          <Button
            asChild
            variant="premium"
            className="w-full justify-start gap-2 rounded-full shadow-premium"
          >
            <Link href={`#offers`}>
              <PremiumIcon icon={ShoppingCart} variant="glow" size="sm" />
              Oferty
              <ArrowRight className="ml-auto h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

