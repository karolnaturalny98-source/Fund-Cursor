"use client";

import { Award, Star, Layers, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { useFadeIn } from "@/lib/animations";

interface CompanyHeroStatsProps {
  cashbackRate: number | null;
  rating: number | null;
  plansCount: number;
  reviewsCount: number;
}

export function CompanyHeroStats({
  cashbackRate,
  rating,
  plansCount,
  reviewsCount,
}: CompanyHeroStatsProps) {
  const statsAnim = useFadeIn({ rootMargin: "-50px" });

  const stats = [
    {
      label: "Cashback",
      value: cashbackRate ? `${cashbackRate} pkt` : "Brak",
      icon: Award,
      color: "text-primary",
      bgColor: "bg-white/10",
    },
    {
      label: "Ocena",
      value: rating ? rating.toFixed(1) : "Brak",
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Plany",
      value: plansCount,
      icon: Layers,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      label: "Opinie",
      value: reviewsCount,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <div ref={statsAnim.ref} className={`grid grid-cols-2 gap-4 lg:grid-cols-4 ${statsAnim.className}`}>
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="group relative overflow-hidden rounded-2xl border border-border/60 transition-all hover:border-primary/50 hover:shadow-md !bg-[rgba(10,12,15,0.72)]"
        >
          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg ${stat.bgColor} p-2 ${stat.color} transition-colors group-hover:opacity-80`}>
                <PremiumIcon icon={stat.icon} variant="glow" size="md" hoverGlow />
              </div>
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

