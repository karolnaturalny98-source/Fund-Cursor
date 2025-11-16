"use client";

import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Section } from "@/components/layout/section";
import { useFadeIn } from "@/lib/animations";

export function AffiliateFinalCta() {
  const ctaAnim = useFadeIn({ rootMargin: "-100px" });
  
  const scrollToForm = () => {
    const formSection = document.getElementById("affiliate-form");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Section size="lg" className="flex flex-col fluid-stack-xl">
      <Card ref={ctaAnim.ref} className={`rounded-3xl border border-primary/50 bg-card/72 shadow-md backdrop-blur-[36px]! ${ctaAnim.className}`}>
        <CardHeader className="flex flex-col fluid-stack-md text-center">
          <PremiumBadge variant="glow" className="mx-auto w-fit rounded-full px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] font-semibold">
            Gotowy do startu?
          </PremiumBadge>
          <CardTitle className="font-semibold text-foreground fluid-h2">
            Dołącz do programu affilacyjnego już dziś
          </CardTitle>
          <p className="mx-auto max-w-2xl text-muted-foreground fluid-copy">
            Wypełnij formularz zgłoszeniowy i zacznij zarabiać z FundedRank. 
            Pomagaj użytkownikom w wyborze najlepszych firm prop tradingowych i otrzymuj część prowizji.
          </p>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button size="lg" variant="premium" onClick={scrollToForm}>
            Złóż zgłoszenie
            <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="ml-2" hoverGlow />
          </Button>
        </CardContent>
      </Card>
    </Section>
  );
}
