"use client";

import { Wallet2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { useScrollAnimation } from "@/lib/animations";
import { useUserPanel } from "@/components/panels/user-panel-context";

export function WalletCtaBanner() {
  const { open } = useUserPanel();
  const ctaAnim = useScrollAnimation({ rootMargin: "-100px" });

  return (
    <section className="container">
      <div 
        ref={ctaAnim.ref}
        className={`relative overflow-hidden glass-card border border-border/60 p-[clamp(2rem,3vw,3.25rem)] shadow-md transition-all duration-700 ${
          ctaAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div className="absolute right-0 top-0 h-full w-1/3 rounded-l-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-wrap gap-[clamp(1.5rem,2vw,2.25rem)] md:flex-nowrap md:items-center md:justify-between">
          <div className="w-full space-y-[clamp(1rem,1.5vw,1.5rem)] md:max-w-xl">
            <PremiumBadge
              variant="glow"
              className="inline-flex items-center gap-[clamp(0.5rem,1vw,0.75rem)] fluid-badge uppercase tracking-[0.3em] text-foreground"
            >
              <PremiumIcon icon={Wallet2} variant="glow" size="default" />
              Portfel cashback
            </PremiumBadge>
            <h2 className="text-[clamp(1.3rem,1.6vw+1rem,1.8rem)] font-semibold text-foreground">
              Zobacz swoje punkty i historię w panelu użytkownika
            </h2>
            <p className="fluid-copy text-muted-foreground">
              Panel pozwala śledzić status cashbacku, kopiować kody i składać
              wnioski o nowe konto. Wymiana punktów na USD zajmuje mniej niż
              minutę.
            </p>
          </div>
          <Button
            onClick={() => open()}
            variant="premium"
            size="lg"
            className="fluid-button w-full rounded-full font-semibold md:w-auto"
          >
            Otwórz panel
            <PremiumIcon icon={ArrowRight} variant="glow" size="default" className="ml-2" hoverGlow />
          </Button>
        </div>
      </div>
    </section>
  );
}
