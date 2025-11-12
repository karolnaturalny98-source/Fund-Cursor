"use client";

import { PremiumBadge } from "@/components/custom/premium-badge";
import { useFadeIn } from "@/lib/animations";

export function AboutHero() {
  const heroContent = useFadeIn({ rootMargin: "-100px" });

  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="container relative z-10 flex flex-col gap-8 py-20 lg:py-28">
        <div ref={heroContent.ref} className={`max-w-3xl space-y-6 ${heroContent.className}`}>
          <PremiumBadge variant="glow" className="px-4 py-1">
            O FundedRank
          </PremiumBadge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Tworzymy przejrzysty ekosystem dla prop traderów
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base leading-relaxed">
            FundedRank to kompleksowa platforma rankingowa firm prop tradingowych, 
            stworzona z pasji do tradingu i dbałości o społeczność. Łączymy 
            niezależne rankingi z systemem cashback, dając traderom narzędzia 
            do podejmowania świadomych decyzji.
          </p>
        </div>
      </div>
    </section>
  );
}

