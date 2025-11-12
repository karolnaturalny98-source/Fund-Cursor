"use client";

import { DollarSign, Gift, TrendingUp, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";
import { cn } from "@/lib/utils";

const benefits = [
  {
    title: "Część prowizji z każdej transakcji",
    description: "Otrzymujesz część prowizji z każdej transakcji wykonanej przez użytkowników, którzy zarejestrowali się przez Twój kod polecający.",
    icon: DollarSign,
    badge: "Pasywny dochód",
  },
  {
    title: "Dedykowany kod polecający",
    description: "Każdy affilat otrzymuje unikalny kod, który można używać w materiałach marketingowych i promocjach.",
    icon: Gift,
    badge: "Unikalny kod",
  },
  {
    title: "Wcześniejszy dostęp do promocji",
    description: "Jako affilat otrzymujesz informacje o nowych promocjach i ofertach specjalnych przed ich publiczną premierą.",
    icon: TrendingUp,
    badge: "Ekskluzywne",
  },
  {
    title: "Materiały marketingowe",
    description: "Otrzymujesz gotowe materiały graficzne, teksty i narzędzia do promocji, które pomogą Ci w budowaniu zasięgu.",
    icon: Users,
    badge: "Wsparcie",
  },
];

export function AffiliateBenefits() {
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });
  const cardsAnim = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(benefits.length, 100);
  const visibleStaggerItems = cardsAnim.isVisible ? staggerItems : new Array(benefits.length).fill(false);

  return (
    <section id="affiliate-benefits" className="container space-y-6 py-12">
      <div ref={sectionAnim.ref} className={`rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-8 shadow-xs ${sectionAnim.className}`}>
        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            Korzyści
          </p>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Dlaczego warto zostać affilatem?
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Program affilacyjny FundedRank został stworzony, aby nagradzać partnerów, 
            którzy pomagają użytkownikom w wyborze najlepszych firm prop tradingowych.
          </p>
        </div>
        <div ref={cardsAnim.ref} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit, index) => (
          <div
            key={benefit.title}
            className={cn(
              "transition-all duration-700",
              `[--delay:${index * 100}ms]`,
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            )}
            style={{ transitionDelay: `var(--delay)` } as React.CSSProperties}
          >
          <Card 
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
          >
            <CardHeader className="space-y-3 pb-3">
              <div className="flex items-start justify-between">
                <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary/20">
                  <PremiumIcon icon={benefit.icon} variant="glow" size="md" hoverGlow />
                </div>
                <PremiumBadge variant="outline" className="rounded-full text-xs font-semibold">
                  {benefit.badge}
                </PremiumBadge>
              </div>
              <CardTitle className="text-lg font-semibold leading-tight">{benefit.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </CardContent>
          </Card>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

