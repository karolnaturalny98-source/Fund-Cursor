"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { useFadeIn } from "@/lib/animations";

export function AboutCta() {
  const ctaAnim = useFadeIn({ rootMargin: "-100px" });

  return (
    <section className="container py-16">
      <div
        ref={ctaAnim.ref}
        className={`mx-auto max-w-3xl space-y-8 rounded-3xl border border-border/60 bg-muted/10 p-8 text-center !backdrop-blur-[36px] lg:p-12 ${ctaAnim.className}`}
      >
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Dołącz do FundedRank
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            Rozpocznij swoją przygodę z prop tradingiem w najlepszym ekosystemie. 
            Porównuj firmy, zbieraj cashback i rozwijaj się z naszą społecznością.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Button
            asChild
            size="lg"
            variant="premium"
            className="h-12 rounded-full px-8 text-base"
          >
            <Link href="/rankingi">
              Przeglądaj ranking
              <PremiumIcon icon={Sparkles} variant="glow" size="sm" className="ml-2" hoverGlow />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="premium-outline"
            className="h-12 rounded-full px-8 text-base"
          >
            <Link href="/baza-wiedzy">
              Dowiedz się więcej
              <PremiumIcon icon={ArrowRight} variant="glow" size="sm" className="ml-2" hoverGlow />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

