"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Section } from "@/components/layout/section";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";
import type { InfluencerProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useUserPanel } from "@/components/panels/user-panel-context";
import { cn } from "@/lib/utils";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

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
        <Heading level={2} variant="section">
          Twórz treści, odbieraj cashback i indywidualne kody
        </Heading>
        <Text variant="body" tone="muted" className="max-w-3xl">
          Dołącz do programu partnerskiego dla twórców. Zyskasz dedykowany kod,
          wcześniejszy dostęp do promocji oraz bezpłatne konta na wymianę
          punktów dla swojej społeczności.
        </Text>
        <Button variant="premium" className="rounded-full font-semibold" onClick={() => open()}>
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
              <Heading level={3} variant="subsectionStrong">
                Ty możesz być pierwszy
              </Heading>
            </CardHeader>
            <CardContent className="flex flex-col fluid-stack-sm">
              <Text variant="body" tone="muted">
                Dołącz do FundedRank jako ambasador i otrzymuj materiały,
                które pomogą Twojej społeczności lepiej wybierać konta
                fundingowe.
              </Text>
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
                  <Heading level={3} variant="subsectionStrong">
                    {profile.handle}
                  </Heading>
                  <Text variant="caption" tone="muted">
                    {profile.bio ?? "Nowy ambasador FundedRank"}
                  </Text>
                </div>
                <PremiumBadge variant="outline" className="fluid-badge rounded-full border-primary/30">
                  {profile.platform}
                </PremiumBadge>
              </CardHeader>
              <CardContent className="flex flex-col fluid-stack-sm">
                <Text
                  variant="caption"
                  tone="primary"
                  className="flex items-center gap-[clamp(0.75rem,1vw,1rem)] text-primary"
                >
                  {profile.audienceSize ? `${profile.audienceSize.toLocaleString("pl-PL")} obserwujących` : "Nowa współpraca"}
                </Text>
                {profile.socialLinks.length ? (
                  <div className="flex flex-wrap gap-[clamp(0.5rem,0.8vw,0.75rem)]">
                    {profile.socialLinks.slice(0, 2).map((link) => (
                      <PremiumBadge asChild key={link} variant="chip" className="gap-2 px-[clamp(0.9rem,1.2vw,1.2rem)] text-primary">
                        <Link href={link} target="_blank" rel="noreferrer">
                          Link
                          <PremiumIcon
                            icon={ArrowUpRight}
                            variant="glow"
                            size="sm"
                            className="fluid-icon-sm"
                            hoverGlow
                          />
                        </Link>
                      </PremiumBadge>
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
