"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { AnimatedCounter } from "@/components/custom/animated-counter";
import { useFadeIn, useScrollAnimation } from "@/lib/animations";
import type { HomepageMetrics } from "@/lib/types";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
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
      <div className="container relative z-10 grid grid-cols-1 items-center gap-8 py-14 sm:gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
        <div ref={heroContent.ref} className={`w-full max-w-2xl space-y-6 sm:space-y-8 ${heroContent.className}`}>
          <PremiumBadge variant="glow" className="fluid-badge">
            {`${metrics.activeInfluencers ?? 0}+ twórców • Cashback • Ranking`}
          </PremiumBadge>
          <div className="space-y-4">
            <h1 className="fluid-h1 font-bold tracking-tight text-foreground">
              FundedRank. Twój kompas w świecie prop tradingu.
            </h1>
            <p className="fluid-lead max-w-xl text-muted-foreground/90">
              Odkrywaj firmy, porównuj plany i wymieniaj punkty 1:1 na kolejne
              konta. Cały ekosystem prop tradingu — w jednym, nowoczesnym
              panelu.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Button asChild variant="premium" className="fluid-button rounded-full">
              <Link href="#ranking">Przeglądaj ranking</Link>
            </Button>
            <Button
              asChild
              variant="premium-outline"
              className="fluid-button rounded-full"
            >
              <Link href="#jak-to-dziala">Jak to działa?</Link>
            </Button>
          </div>
        </div>
        <Card
          ref={statsCardAnim.ref}
          className={cn(
            "glass-card bg-card/80 backdrop-blur-[36px]! w-full max-w-xl mx-auto lg:mx-0 overflow-hidden border border-border/70 shadow-premium transition-all duration-700",
            statsCardAnim.isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
          )}
        >
          <CardHeader className="border-b border-border/60 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Ostatnie 30 dni ekosystemu
            </p>
            <p className="text-[clamp(1.75rem,2vw+1.25rem,2.5rem)] font-bold text-primary">
              <AnimatedCounter
                value={metrics.totalCashback ?? 0}
                formatter={(val) => currencyFormatter.format(val)}
              />
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 sm:gap-4 pt-6">
            {stats.map((item) => (
              <div
                key={item.label}
                className="flex h-full flex-col justify-between rounded-2xl glass-panel p-4 transition-all hover:border-primary/40"
              >
                <span className="text-[clamp(0.7rem,0.5vw+0.6rem,0.85rem)] uppercase tracking-[0.18em] text-muted-foreground/80">
                  {item.label}
                </span>
                <span className="mt-3 text-[clamp(1.75rem,1.8vw+1.25rem,2.25rem)] font-semibold text-foreground">
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
