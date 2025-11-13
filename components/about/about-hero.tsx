"use client";

import { PremiumBadge } from "@/components/custom/premium-badge";
import { useFadeIn } from "@/lib/animations";

export function AboutHero() {
  const heroContent = useFadeIn({ rootMargin: "-100px" });

  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="container relative z-10 flex flex-col gap-[clamp(2rem,3vw,3rem)] py-[clamp(3rem,4vw,4.5rem)]">
        <div ref={heroContent.ref} className={`max-w-3xl space-y-[clamp(1.25rem,1.8vw,1.6rem)] ${heroContent.className}`}>
          <PremiumBadge variant="glow" className="fluid-badge rounded-full font-semibold">
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
    </section>
  );
}

