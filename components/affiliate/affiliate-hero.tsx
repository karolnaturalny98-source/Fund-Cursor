"use client";

import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { useFadeIn } from "@/lib/animations";

export function AffiliateHero() {
  const heroAnim = useFadeIn({ rootMargin: "-100px" });
  
  const scrollToForm = () => {
    const formSection = document.getElementById("affiliate-form");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div
        ref={heroAnim.ref}
        className={`container relative z-10 flex flex-col gap-[clamp(2.5rem,3.5vw,3.75rem)] py-[clamp(3rem,4vw,4.25rem)] lg:flex-row lg:items-center lg:justify-between ${heroAnim.className}`}
      >
        <div className="max-w-2xl space-y-[clamp(1.5rem,2.2vw,2rem)]">
          <PremiumBadge variant="glow" className="fluid-badge rounded-full font-semibold">
            Program Affilacyjny FundedRank
          </PremiumBadge>
          <div className="space-y-[clamp(1rem,1.5vw,1.35rem)]">
            <h1 className="fluid-h1 font-bold tracking-tight text-foreground">
              Zostań affilatem i zarabiaj z nami
            </h1>
            <p className="max-w-xl text-muted-foreground fluid-copy">
              Dołącz do programu partnerskiego FundedRank i otrzymuj część prowizji z każdej transakcji. 
              Promuj najlepsze firmy prop tradingowe i buduj pasywny dochód, pomagając użytkownikom 
              w wyborze idealnego konta fundingowego.
            </p>
          </div>
          <div className="flex flex-col gap-[clamp(0.75rem,1.1vw,1rem)] sm:flex-row sm:items-center">
            <Button 
              size="lg" 
              variant="premium" 
              className="fluid-button"
              onClick={scrollToForm}
            >
              Zostań affilatem
              <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="ml-2" hoverGlow />
            </Button>
            <Button
              size="lg"
              variant="premium-outline"
              className="fluid-button"
              onClick={() => {
                const benefitsSection = document.getElementById("affiliate-benefits");
                if (benefitsSection) {
                  benefitsSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              Dowiedz się więcej
            </Button>
          </div>
        </div>
        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-primary/50 bg-card/72 shadow-md backdrop-blur-[36px]!">
          <div className="border-b border-border/40 bg-primary/10 px-[clamp(1.5rem,2vw,1.9rem)] py-[clamp(1.25rem,1.8vw,1.6rem)]">
            <p className="font-semibold tracking-[0.18em] text-muted-foreground fluid-eyebrow">
              Program Affilacyjny
            </p>
            <p className="mt-[clamp(0.5rem,0.75vw,0.7rem)] text-[clamp(1.75rem,2.4vw,2.25rem)] font-bold text-primary">
              Część prowizji z każdej transakcji
            </p>
          </div>
          <div className="grid grid-cols-1 gap-[clamp(1rem,1.6vw,1.4rem)] px-[clamp(1.5rem,2vw,1.9rem)] py-[clamp(1.5rem,2vw,1.9rem)]">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card/72 p-[clamp(1rem,1.4vw,1.25rem)] shadow-xs transition-all hover:border-primary/50 hover:shadow-md backdrop-blur-[36px]!">
              <span className="uppercase tracking-[0.2em] text-muted-foreground fluid-eyebrow">
                Dedykowany kod polecający
              </span>
              <span className="mt-[clamp(0.75rem,1.1vw,1rem)] text-[clamp(1.5rem,1.9vw,1.8rem)] font-semibold text-foreground">
                Twój unikalny kod
              </span>
            </div>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card/72 p-[clamp(1rem,1.4vw,1.25rem)] shadow-xs transition-all hover:border-primary/50 hover:shadow-md backdrop-blur-[36px]!">
              <span className="uppercase tracking-[0.2em] text-muted-foreground fluid-eyebrow">
                Wcześniejszy dostęp
              </span>
              <span className="mt-[clamp(0.75rem,1.1vw,1rem)] text-[clamp(1.5rem,1.9vw,1.8rem)] font-semibold text-foreground">
                Do promocji i nowości
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

