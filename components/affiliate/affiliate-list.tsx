"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import type { InfluencerProfile } from "@/lib/types";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";

interface AffiliateListProps {
  affiliates: InfluencerProfile[];
}

export function AffiliateList({ affiliates }: AffiliateListProps) {
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });
  const cardsAnim = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(affiliates.length, 100);
  const visibleStaggerItems = cardsAnim.isVisible ? staggerItems : new Array(affiliates.length).fill(false);

  if (affiliates.length === 0) {
    return (
      <section className="container space-y-6 py-12">
        <div ref={sectionAnim.ref} className={`rounded-3xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-8 shadow-xs ${sectionAnim.className}`}>
          <div className="space-y-3 mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              Nasi affilaci
            </p>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Dołącz do grona affilatów
            </h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Zobacz, kto już współpracuje z nami i promuje FundedRank w swoich kanałach.
            </p>
          </div>
        <Card className="group relative overflow-hidden rounded-3xl border border-dashed border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Ty możesz być pierwszy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Dołącz do FundedRank jako affilat i otrzymuj materiały,
              które pomogą Twojej społeczności lepiej wybierać konta
              fundingowe. Zaczynaj zarabiać już dziś!
            </p>
          </CardContent>
        </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="container space-y-6 py-12">
      <div ref={sectionAnim.ref} className={`rounded-3xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-8 shadow-xs ${sectionAnim.className}`}>
        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            Nasi affilaci
          </p>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Dołącz do grona affilatów
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Zobacz, kto już współpracuje z nami i promuje FundedRank w swoich kanałach.
          </p>
        </div>
      <div ref={cardsAnim.ref} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {affiliates.map((affiliate, index) => (
          <div
            key={affiliate.id}
            className={`transition-all duration-700 ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
          <Card 
            className="group relative overflow-hidden rounded-3xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  {affiliate.handle}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {affiliate.bio ?? "Affilat FundedRank"}
                </p>
              </div>
              <PremiumBadge variant="outline" className="rounded-full border-primary/30 text-xs">
                {affiliate.platform}
              </PremiumBadge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-primary">
                {affiliate.audienceSize ? (
                  <span className="font-semibold">
                    {affiliate.audienceSize.toLocaleString("pl-PL")} obserwujących
                  </span>
                ) : (
                  <span className="text-muted-foreground">Nowa współpraca</span>
                )}
              </div>
              {affiliate.socialLinks.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {affiliate.socialLinks.slice(0, 2).map((link) => (
                    <Link
                      key={link}
                      href={link}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-3 py-1 text-xs text-primary transition-all hover:border-primary/50 hover:bg-primary/10 hover:shadow-xs"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Link <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="h-3 w-3" hoverGlow />
                    </Link>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

