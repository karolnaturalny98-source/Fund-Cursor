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
        className={`relative overflow-hidden glass-card border border-border/60 p-8 md:p-12 shadow-md transition-all duration-700 ${
          ctaAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div className="absolute right-0 top-0 h-full w-1/3 rounded-l-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-4">
            <PremiumBadge variant="glow" className="inline-flex items-center gap-2 px-4 py-1 uppercase tracking-[0.3em] text-foreground">
              <PremiumIcon icon={Wallet2} variant="glow" size="default" />
              Portfel cashback
            </PremiumBadge>
            <h2 className="text-xl font-semibold text-foreground md:text-2xl">
              Zobacz swoje punkty i historię w panelu użytkownika
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Panel pozwala śledzić status cashbacku, kopiować kody i składać
              wnioski o nowe konto. Wymiana punktów na USD zajmuje mniej niż
              minutę.
            </p>
          </div>
          <Button
            onClick={() => open()}
            variant="premium"
            size="lg"
            className="h-12 rounded-full px-6 text-sm font-semibold"
          >
            Otwórz panel
            <PremiumIcon icon={ArrowRight} variant="glow" size="default" className="ml-2" hoverGlow />
          </Button>
        </div>
      </div>
    </section>
  );
}
