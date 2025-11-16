"use client";

import { PremiumBadge } from "@/components/custom/premium-badge";
import { Section } from "@/components/layout/section";
import { useFadeIn } from "@/lib/animations";

export function AboutHero() {
  const heroContent = useFadeIn({ rootMargin: "-100px" });

  return (
    <Section bleed size="lg" className="relative overflow-hidden border-b border-border/40">
      <div className="container relative z-10 flex flex-col fluid-stack-xl">
        <div ref={heroContent.ref} className={`max-w-3xl flex flex-col fluid-stack-md ${heroContent.className}`}>
          <PremiumBadge variant="glow" className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] rounded-full font-semibold">
            O FundedRank
          </PremiumBadge>
          <h1 className="fluid-h1 font-bold tracking-tight text-foreground">
            Tworzymy przejrzysty ekosystem dla prop traderów
          </h1>
          <p className="max-w-2xl text-muted-foreground leading-relaxed fluid-copy">
            FundedRank to kompleksowa platforma rankingowa firm prop tradingowych, 
            stworzona z pasji do tradingu i dbałości o społeczność. Łączymy 
            niezależne rankingi z systemem cashback, dając traderom narzędzia 
            do podejmowania świadomych decyzji.
          </p>
        </div>
      </div>
    </Section>
  );
}

