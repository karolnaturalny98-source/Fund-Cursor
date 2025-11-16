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
import { buttonVariants } from "@/components/ui/button";
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
  companySlug: _companySlug,
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
    <div className="grid gap-[clamp(1rem,1.5vw,1.5rem)] lg:grid-cols-3">
      {/* Kolumna 1: Wykres compact + statystyki */}
      <Card variant="gradient" className="rounded-2xl backdrop-blur-[36px]! transition-all hover:shadow-[0_35px_80px_-35px_rgba(15,23,42,0.55)]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-[clamp(0.65rem,0.9vw,0.85rem)]">
            <TrendingUp className="h-[clamp(1.2rem,0.4vw+1.1rem,1.35rem)] w-[clamp(1.2rem,0.4vw+1.1rem,1.35rem)] text-primary" />
            <CardTitle className="text-[clamp(1.05rem,0.5vw+0.95rem,1.25rem)] font-semibold">Popularność</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-[clamp(1rem,1.5vw,1.4rem)]">
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
              <p className="fluid-caption text-muted-foreground">Brak danych</p>
            </div>
          )}

          {quickStats.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-[clamp(0.65rem,0.9vw,0.85rem)] rounded-lg border border-border/40 bg-muted/20 px-[clamp(0.75rem,1.1vw,1rem)] py-[clamp(0.6rem,0.9vw,0.85rem)]"
                >
                  {stat.icon}
                  <div className="flex-1">
                    <p className="fluid-caption text-muted-foreground">{stat.label}</p>
                    <p className="text-[clamp(0.95rem,0.4vw+0.85rem,1.05rem)] font-semibold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kolumna 2: Alerty ryzyka */}
      {alerts.length > 0 ? (
        <Card variant="gradient" className="rounded-2xl backdrop-blur-[36px]! transition-all hover:shadow-[0_35px_80px_-35px_rgba(15,23,42,0.55)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-[clamp(0.65rem,0.9vw,0.85rem)]">
              <AlertTriangle className="h-[clamp(1.2rem,0.4vw+1.1rem,1.35rem)] w-[clamp(1.2rem,0.4vw+1.1rem,1.35rem)] text-amber-500" />
              <CardTitle className="text-[clamp(1.05rem,0.5vw+0.95rem,1.25rem)] font-semibold">Alerty ryzyka</CardTitle>
            </div>
            <p className="fluid-caption text-muted-foreground">
              Ważne informacje do rozważenia
            </p>
          </CardHeader>
          <CardContent className="space-y-[clamp(0.85rem,1.1vw,1.05rem)]">
            {alerts.slice(0, 2).map((alert) => (
              <RiskAlertCard key={alert.id} alert={alert} />
            ))}
            {alerts.length > 2 && (
              <p className="fluid-caption text-center text-muted-foreground">
                +{alerts.length - 2} więcej alertów poniżej
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card variant="gradient" className="rounded-2xl backdrop-blur-[36px]!">
          <CardContent className="flex h-full items-center justify-center py-8">
            <div className="text-center">
              <PremiumIcon icon={Shield} variant="glow" size="lg" className="mx-auto mb-2 text-primary" />
              <p className="text-[clamp(0.95rem,0.4vw+0.85rem,1.05rem)] font-medium text-foreground">Brak alertów</p>
              <p className="fluid-caption text-muted-foreground">Firma nie ma znanych ostrzeżeń</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kolumna 3: Quick actions */}
      <Card variant="gradient" className="rounded-2xl backdrop-blur-[36px]! transition-all hover:shadow-[0_35px_80px_-35px_rgba(15,23,42,0.55)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-[clamp(1.05rem,0.5vw+0.95rem,1.25rem)] font-semibold">Szybkie linki</CardTitle>
          <p className="fluid-caption text-muted-foreground">
            Przejdź do innych sekcji
          </p>
        </CardHeader>
        <CardContent className="space-y-[clamp(0.75rem,1.1vw,1rem)]">
          <Link
            href="#challenges"
            className={cn(
              buttonVariants({ variant: "premium-outline" }),
              "w-full justify-start gap-[clamp(0.65rem,0.9vw,0.85rem)] rounded-full",
            )}
          >
            <PremiumIcon icon={Layers} variant="glow" size="sm" />
            Wyzwania
          </Link>
          <Link
            href="#reviews"
            className={cn(
              buttonVariants({ variant: "premium-outline" }),
              "w-full justify-start gap-[clamp(0.65rem,0.9vw,0.85rem)] rounded-full",
            )}
          >
            <PremiumIcon icon={MessageSquare} variant="glow" size="sm" />
            Opinie
          </Link>
          <Link
            href="#offers"
            className={cn(
              buttonVariants({ variant: "premium" }),
              "w-full justify-start gap-[clamp(0.65rem,0.9vw,0.85rem)] rounded-full shadow-premium",
            )}
          >
            <PremiumIcon icon={ShoppingCart} variant="glow" size="sm" />
            Oferty
            <ArrowRight className="ml-auto h-[clamp(1rem,0.4vw+0.9rem,1.1rem)] w-[clamp(1rem,0.4vw+0.9rem,1.1rem)]" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
