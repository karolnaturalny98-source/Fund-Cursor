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
      <div ref={heroAnim.ref} className={`container relative z-10 flex flex-col gap-12 py-20 lg:flex-row lg:items-center lg:justify-between ${heroAnim.className}`}>
        <div className="max-w-2xl space-y-8">
          <PremiumBadge variant="glow" className="px-4 py-1">
            Program Affilacyjny FundedRank
          </PremiumBadge>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Zostań affilatem i zarabiaj z nami
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Dołącz do programu partnerskiego FundedRank i otrzymuj część prowizji z każdej transakcji. 
              Promuj najlepsze firmy prop tradingowe i buduj pasywny dochód, pomagając użytkownikom 
              w wyborze idealnego konta fundingowego.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button 
              size="lg" 
              variant="premium" 
              className="h-12 rounded-full px-8 text-base"
              onClick={scrollToForm}
            >
              Zostań affilatem
              <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="ml-2" hoverGlow />
            </Button>
            <Button
              size="lg"
              variant="premium-outline"
              className="h-12 rounded-full px-8 text-base"
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
        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-primary/50 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-md">
          <div className="border-b border-border/40 bg-primary/10 px-6 py-5">
            <p className="text-sm font-semibold tracking-wide text-muted-foreground">
              Program Affilacyjny
            </p>
            <p className="mt-2 text-3xl font-bold text-primary">
              Część prowizji z każdej transakcji
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 px-6 py-6">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Dedykowany kod polecający
              </span>
              <span className="mt-3 text-2xl font-semibold text-foreground">
                Twój unikalny kod
              </span>
            </div>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Wcześniejszy dostęp
              </span>
              <span className="mt-3 text-2xl font-semibold text-foreground">
                Do promocji i nowości
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

