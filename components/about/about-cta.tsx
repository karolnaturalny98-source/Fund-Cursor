"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Section } from "@/components/layout/section";
import { useFadeIn } from "@/lib/animations";

export function AboutCta() {
  const ctaAnim = useFadeIn({ rootMargin: "-100px" });

  return (
    <Section size="lg">
      <div
        ref={ctaAnim.ref}
        className={`mx-auto max-w-3xl flex flex-col fluid-stack-lg rounded-3xl border border-border/60 bg-muted/10 p-[clamp(1.5rem,2vw,2rem)] text-center backdrop-blur-[36px]! lg:p-[clamp(2rem,3vw,3rem)] ${ctaAnim.className}`}
      >
        <div className="flex flex-col fluid-stack-sm">
          <h2 className="fluid-h2 font-bold text-foreground">
            Dołącz do FundedRank
          </h2>
          <p className="mx-auto max-w-2xl fluid-copy text-muted-foreground">
            Rozpocznij swoją przygodę z prop tradingiem w najlepszym ekosystemie. 
            Porównuj firmy, zbieraj cashback i rozwijaj się z naszą społecznością.
          </p>
        </div>

        <div className="flex flex-col fluid-stack-sm sm:flex-row sm:items-center sm:justify-center">
          <Button asChild variant="premium" className="rounded-full">
            <Link href="/rankingi">
              Przeglądaj ranking
              <PremiumIcon icon={Sparkles} variant="glow" size="sm" className="ml-2" hoverGlow />
            </Link>
          </Button>
          <Button
            asChild
            variant="premium-outline"
            className="rounded-full"
          >
            <Link href="/baza-wiedzy">
              Dowiedz się więcej
              <PremiumIcon icon={ArrowRight} variant="glow" size="sm" className="ml-2" hoverGlow />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
