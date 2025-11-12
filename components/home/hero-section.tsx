"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { AnimatedCounter } from "@/components/custom/animated-counter";
import { useFadeIn, useScrollAnimation } from "@/lib/animations";
import type { HomepageMetrics } from "@/lib/types";
import { cn } from "@/lib/utils";

const numberFormatter = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 0,
});

export function HeroSection({ metrics }: { metrics: HomepageMetrics }) {
  const heroContent = useFadeIn({ rootMargin: "-100px" });
  const statsCardAnim = useScrollAnimation({ rootMargin: "-100px" });

  const stats = [
    {
      label: "Firmy w rankingu",
      value: metrics.totalCompanies,
    },
    {
      label: "Aktywne plany",
      value: metrics.totalPlans ?? 0,
    },
    {
      label: "Zweryfikowane opinie",
      value: metrics.approvedReviews ?? 0,
    },
    {
      label: "Cashback (pkt)",
      value: metrics.totalCashback ?? 0,
    },
  ];

  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="container relative z-10 flex flex-col gap-12 py-16 lg:flex-row lg:items-center lg:justify-between">
        <div ref={heroContent.ref} className={`max-w-2xl space-y-8 ${heroContent.className}`}>
          <PremiumBadge variant="glow" className="px-4 py-1">
            {`${metrics.activeInfluencers ?? 0}+ twórców • Cashback • Ranking`}
          </PremiumBadge>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              FundedRank. Twój kompas w świecie prop tradingu.
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Odkrywaj firmy, porównuj plany i wymieniaj punkty 1:1 na kolejne
              konta. Cały ekosystem prop tradingu — w jednym, nowoczesnym
              panelu.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" variant="premium" className="h-12 rounded-full px-8 text-base">
              <Link href="#ranking">Przeglądaj ranking</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="premium-outline"
              className="h-12 rounded-full px-8 text-base"
            >
              <Link href="#jak-to-dziala">Jak to działa?</Link>
            </Button>
          </div>
        </div>
        <Card
          ref={statsCardAnim.ref}
          className={cn(
            "glass-card !bg-[rgba(10,12,15,0.8)] !backdrop-blur-[36px] w-full max-w-lg overflow-hidden border border-border/70 shadow-premium transition-all duration-700",
            statsCardAnim.isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
          )}
        >
          <CardHeader className="border-b border-border/60">
            <p className="text-sm font-semibold tracking-wide text-muted-foreground">
              Ostatnie 30 dni ekosystemu
            </p>
            <p className="text-3xl font-bold text-primary">
              <AnimatedCounter
                value={metrics.totalCashback ?? 0}
                formatter={(val) => numberFormatter.format(val) + " pkt cashback"}
              />
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-2">
            {stats.map((item) => (
              <div
                key={item.label}
                className="flex h-full flex-col justify-between rounded-2xl glass-panel p-4 transition-all hover:border-primary/40"
              >
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </span>
                <span className="mt-3 text-2xl font-semibold text-foreground">
                  <AnimatedCounter value={item.value} />
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
