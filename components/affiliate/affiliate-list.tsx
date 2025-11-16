"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/layout/section";
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
      <Section size="lg" className="flex flex-col fluid-stack-xl">
        <div ref={sectionAnim.ref} className={`rounded-3xl border border-border/60 bg-card/72 p-[clamp(1.75rem,2.5vw,2.2rem)] shadow-xs backdrop-blur-[36px]! ${sectionAnim.className}`}>
          <div className="mb-[clamp(1.25rem,1.8vw,1.6rem)] flex flex-col fluid-stack-sm">
            <p className="font-semibold uppercase tracking-[0.28em] text-primary fluid-eyebrow">
              Nasi affilaci
            </p>
            <h2 className="font-semibold text-foreground fluid-h2">
              Dołącz do grona affilatów
            </h2>
            <p className="max-w-3xl text-muted-foreground fluid-copy">
              Zobacz, kto już współpracuje z nami i promuje FundedRank w swoich kanałach.
            </p>
          </div>
        <Card className="group relative overflow-hidden rounded-3xl border border-dashed border-border/60 bg-card/72 p-[clamp(1.5rem,2vw,1.9rem)] shadow-xs transition-all hover:border-primary/50 hover:shadow-md backdrop-blur-[36px]!">
          <CardHeader>
            <CardTitle className="font-semibold text-foreground fluid-copy">
              Ty możesz być pierwszy
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col fluid-stack-sm text-muted-foreground fluid-copy">
            <p>
              Dołącz do FundedRank jako affilat i otrzymuj materiały,
              które pomogą Twojej społeczności lepiej wybierać konta
              fundingowe. Zaczynaj zarabiać już dziś!
            </p>
          </CardContent>
        </Card>
        </div>
      </Section>
    );
  }

  return (
    <Section size="lg" className="flex flex-col fluid-stack-xl">
      <div ref={sectionAnim.ref} className={`rounded-3xl border border-border/60 bg-card/72 p-[clamp(1.75rem,2.5vw,2.2rem)] shadow-xs backdrop-blur-[36px]! ${sectionAnim.className}`}>
        <div className="mb-[clamp(1.25rem,1.8vw,1.6rem)] flex flex-col fluid-stack-sm">
          <p className="font-semibold uppercase tracking-[0.28em] text-primary fluid-eyebrow">
            Nasi affilaci
          </p>
          <h2 className="font-semibold text-foreground fluid-h2">
            Dołącz do grona affilatów
          </h2>
          <p className="max-w-3xl text-muted-foreground fluid-copy">
            Zobacz, kto już współpracuje z nami i promuje FundedRank w swoich kanałach.
          </p>
        </div>
      <div ref={cardsAnim.ref} className="grid fluid-stack-md md:grid-cols-2 lg:grid-cols-3">
        {affiliates.map((affiliate, index) => (
          <div
            key={affiliate.id}
            className={`transition-all duration-700 delay-[var(--delay)] ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
          >
          <Card 
            className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/72 p-[clamp(1.5rem,2vw,1.9rem)] shadow-xs transition-all hover:border-primary/50 hover:shadow-md backdrop-blur-[36px]!"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-[clamp(0.75rem,1.1vw,1rem)] pb-[clamp(0.75rem,1.1vw,1rem)]">
              <div>
                <CardTitle className="font-semibold text-foreground fluid-copy">
                  {affiliate.handle}
                </CardTitle>
                <p className="text-muted-foreground fluid-caption">
                  {affiliate.bio ?? "Affilat FundedRank"}
                </p>
              </div>
              <PremiumBadge variant="outline" className="rounded-full border-primary/30 px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)]">
                {affiliate.platform}
              </PremiumBadge>
            </CardHeader>
            <CardContent className="flex flex-col fluid-stack-sm">
              <div className="flex items-center gap-[clamp(0.5rem,0.75vw,0.65rem)] text-primary fluid-caption">
                {affiliate.audienceSize ? (
                  <span className="font-semibold text-foreground fluid-copy">
                    {affiliate.audienceSize.toLocaleString("pl-PL")} obserwujących
                  </span>
                ) : (
                  <span className="text-muted-foreground fluid-caption">Nowa współpraca</span>
                )}
              </div>
              {affiliate.socialLinks.length > 0 ? (
                <div className="flex flex-wrap gap-[clamp(0.45rem,0.7vw,0.6rem)]">
                  {affiliate.socialLinks.slice(0, 2).map((link) => (
                    <Badge
                      key={link}
                      asChild
                      variant="chip"
                      className="gap-[clamp(0.35rem,0.5vw,0.45rem)] px-[clamp(0.9rem,1.3vw,1.2rem)] text-primary"
                    >
                      <Link href={link} target="_blank" rel="noreferrer">
                        Link{" "}
                        <PremiumIcon
                          icon={ArrowUpRight}
                          variant="glow"
                          size="sm"
                          className="h-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)] w-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)]"
                          hoverGlow
                        />
                      </Link>
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
          </div>
        ))}
      </div>
      </div>
    </Section>
  );
}
