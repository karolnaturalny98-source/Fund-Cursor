"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Section } from "@/components/layout/section";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";
import type { InfluencerProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useUserPanel } from "@/components/panels/user-panel-context";
import { cn } from "@/lib/utils";

export function InfluencerSpotlight({ influencers }: { influencers: InfluencerProfile[] }) {
  const { open } = useUserPanel();
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });
  const sectionVisible = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(Math.max(influencers.length, 1), 100);
  const visibleStaggerItems = sectionVisible.isVisible ? staggerItems : new Array(Math.max(influencers.length, 1)).fill(false);

  return (
    <Section
      ref={sectionVisible.ref}
      className="grid fluid-stack-xl lg:grid-cols-[3fr_2fr]"
      id="influencerzy"
      size="lg"
    >
      <div ref={sectionAnim.ref} className={cn("flex flex-col fluid-stack-md", sectionAnim.className)}>
        <PremiumBadge variant="glow" className="fluid-badge rounded-full font-semibold">
          Program influencerów FundedRank
        </PremiumBadge>
        <h2 className="fluid-h2 font-semibold text-foreground">
          Twórz treści, odbieraj cashback i indywidualne kody
        </h2>
        <p className="fluid-copy max-w-3xl text-muted-foreground">
          Dołącz do programu partnerskiego dla twórców. Zyskasz dedykowany kod,
          wcześniejszy dostęp do promocji oraz bezpłatne konta na wymianę
          punktów dla swojej społeczności.
        </p>
        <Button
          variant="premium"
          className="fluid-button rounded-full font-semibold"
          onClick={() => open()}
        >
          Dołącz jako influencer
          <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="ml-2" hoverGlow />
        </Button>
      </div>
      <div className="grid fluid-stack-lg">
        {influencers.length === 0 ? (
          <Card
            className={`group relative overflow-hidden rounded-3xl border border-border/60 border-dashed transition-all duration-700 hover:border-primary/50 hover:shadow-md delay-[var(--delay)] ${
              visibleStaggerItems[0] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": "0ms" } as React.CSSProperties}
          >
            <CardHeader>
              <CardTitle className="text-[clamp(1.1rem,0.6vw+0.95rem,1.3rem)] font-semibold text-foreground">
                Ty możesz być pierwszy
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col fluid-stack-sm text-muted-foreground fluid-copy">
              <p>
                Dołącz do FundedRank jako ambasador i otrzymuj materiały,
                które pomogą Twojej społeczności lepiej wybierać konta
                fundingowe.
              </p>
            </CardContent>
          </Card>
        ) : (
          influencers.map((profile, index) => (
            <Card
              key={profile.id}
              className={cn(
                "group relative overflow-hidden rounded-3xl border border-border/60 transition-all duration-700 delay-[var(--delay)] hover:border-primary/50 hover:shadow-md",
                visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              )}
              style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-[clamp(1rem,1.5vw,1.5rem)] pb-2">
                <div>
                  <CardTitle className="text-[clamp(0.95rem,0.5vw+0.85rem,1.1rem)] font-semibold text-foreground">
                    {profile.handle}
                  </CardTitle>
                  <p className="fluid-caption text-muted-foreground">
                    {profile.bio ?? "Nowy ambasador FundedRank"}
                  </p>
                </div>
                <PremiumBadge variant="outline" className="fluid-badge rounded-full border-primary/30">
                  {profile.platform}
                </PremiumBadge>
              </CardHeader>
              <CardContent className="flex flex-col fluid-stack-sm text-muted-foreground fluid-caption">
                <div className="flex items-center gap-[clamp(0.75rem,1vw,1rem)] text-[clamp(0.85rem,0.4vw+0.75rem,0.95rem)] text-primary">
                  {profile.audienceSize ? `${profile.audienceSize.toLocaleString("pl-PL")} obserwujących` : "Nowa współpraca"}
                </div>
                {profile.socialLinks.length ? (
                  <div className="flex flex-wrap gap-[clamp(0.5rem,0.8vw,0.75rem)]">
                    {profile.socialLinks.slice(0, 2).map((link) => (
                      <Link
                        key={link}
                        href={link}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-[clamp(0.75rem,1vw,1rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] text-primary transition-all hover:border-primary/50 hover:bg-primary/10 hover:shadow-xs fluid-caption"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Link{" "}
                        <PremiumIcon
                          icon={ArrowUpRight}
                          variant="glow"
                          size="sm"
                          className="h-[clamp(0.75rem,0.4vw+0.65rem,0.95rem)] w-[clamp(0.75rem,0.4vw+0.65rem,0.95rem)]"
                          hoverGlow
                        />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Section>
  );
}
