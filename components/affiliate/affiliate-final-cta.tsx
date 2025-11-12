"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
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
    <section className="container space-y-6 py-12">
      <Card ref={ctaAnim.ref} className={`rounded-3xl border border-primary/50 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-md ${ctaAnim.className}`}>
        <CardHeader className="space-y-4 text-center">
          <PremiumBadge variant="glow" className="mx-auto w-fit rounded-full px-4 py-1 text-xs font-semibold">
            Gotowy do startu?
          </PremiumBadge>
          <CardTitle className="text-3xl font-semibold sm:text-4xl">
            Dołącz do programu affilacyjnego już dziś
          </CardTitle>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Wypełnij formularz zgłoszeniowy i zacznij zarabiać z FundedRank. 
            Pomagaj użytkownikom w wyborze najlepszych firm prop tradingowych i otrzymuj część prowizji.
          </p>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            size="lg"
            variant="premium"
            className="rounded-full px-8 text-base"
            onClick={scrollToForm}
          >
            Złóż zgłoszenie
            <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="ml-2" hoverGlow />
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

