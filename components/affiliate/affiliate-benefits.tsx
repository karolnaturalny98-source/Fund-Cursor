"use client";

import { DollarSign, Gift, TrendingUp, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Section } from "@/components/layout/section";
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
    <Section
      id="affiliate-benefits"
      size="lg"
      className="flex flex-col fluid-stack-xl"
    >
      <div
        ref={sectionAnim.ref}
        className={`rounded-3xl border border-border/60 bg-card/72 p-[clamp(1.75rem,2.5vw,2.2rem)] shadow-xs backdrop-blur-[36px]! ${sectionAnim.className}`}
      >
        <div className="mb-[clamp(1.25rem,1.8vw,1.6rem)] flex flex-col fluid-stack-sm">
          <p className="font-semibold uppercase tracking-[0.28em] text-primary fluid-eyebrow">
            Korzyści
          </p>
          <h2 className="font-semibold text-foreground fluid-h2">
            Dlaczego warto zostać affilatem?
          </h2>
          <p className="max-w-3xl text-muted-foreground fluid-copy">
            Program affilacyjny FundedRank został stworzony, aby nagradzać partnerów, 
            którzy pomagają użytkownikom w wyborze najlepszych firm prop tradingowych.
          </p>
        </div>
        <div ref={cardsAnim.ref} className="grid gap-[clamp(1rem,1.5vw,1.35rem)] md:grid-cols-2 lg:grid-cols-4">
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
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/72 p-[clamp(1.1rem,1.5vw,1.3rem)] shadow-xs transition-all hover:border-primary/50 hover:shadow-md backdrop-blur-[36px]!"
          >
            <CardHeader className="flex flex-col fluid-stack-sm pb-[clamp(0.75rem,1.1vw,1rem)]">
              <div className="flex items-start justify-between">
                <div className="mt-0.5 rounded-lg bg-primary/10 p-[clamp(0.6rem,0.85vw,0.75rem)] text-primary transition-transform group-hover:scale-110 group-hover:bg-primary/20">
                  <PremiumIcon icon={benefit.icon} variant="glow" size="md" hoverGlow />
                </div>
                <PremiumBadge variant="outline" className="fluid-badge rounded-full font-semibold">
                  {benefit.badge}
                </PremiumBadge>
              </div>
              <CardTitle className="font-semibold leading-tight text-foreground fluid-copy">{benefit.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="leading-relaxed text-muted-foreground fluid-caption">
                {benefit.description}
              </p>
            </CardContent>
          </Card>
          </div>
        ))}
      </div>
      </div>
    </Section>
  );
}

