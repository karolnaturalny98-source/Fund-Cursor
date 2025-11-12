"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";
import type { InfluencerProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useUserPanel } from "@/components/panels/user-panel-context";

export function InfluencerSpotlight({ influencers }: { influencers: InfluencerProfile[] }) {
  const { open } = useUserPanel();
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });
  const sectionVisible = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(Math.max(influencers.length, 1), 100);
  const visibleStaggerItems = sectionVisible.isVisible ? staggerItems : new Array(Math.max(influencers.length, 1)).fill(false);

  return (
    <section ref={sectionVisible.ref} className="container grid gap-8 lg:grid-cols-[3fr_2fr]" id="influencerzy">
      <div ref={sectionAnim.ref} className={`space-y-4 ${sectionAnim.className}`}>
        <PremiumBadge variant="glow" className="rounded-full px-4 py-1 text-xs font-semibold">
          Program influencerów FundedRank
        </PremiumBadge>
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Twórz treści, odbieraj cashback i indywidualne kody
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Dołącz do programu partnerskiego dla twórców. Zyskasz dedykowany kod,
          wcześniejszy dostęp do promocji oraz bezpłatne konta na wymianę
          punktów dla swojej społeczności.
        </p>
        <Button
          variant="premium"
          className="rounded-full px-8 text-sm font-semibold"
          onClick={() => open()}
        >
          Dołącz jako influencer
          <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="ml-2" hoverGlow />
        </Button>
      </div>
      <div className="grid gap-4">
        {influencers.length === 0 ? (
          <Card
            className={`group relative overflow-hidden rounded-3xl border border-border/60 border-dashed transition-all hover:border-primary/50 hover:shadow-md ${
              visibleStaggerItems[0] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": "0ms" } as React.CSSProperties}
            className="transition-all duration-700 delay-[var(--delay)]"
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Ty możesz być pierwszy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
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
              className={`group relative overflow-hidden rounded-3xl border border-border/60 transition-all hover:border-primary/50 hover:shadow-md ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
              style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
              className="transition-all duration-700 delay-[var(--delay)]"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">
                    {profile.handle}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{profile.bio ?? "Nowy ambasador FundedRank"}</p>
                </div>
                <PremiumBadge variant="outline" className="rounded-full border-primary/30 text-xs">
                  {profile.platform}
                </PremiumBadge>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-3 text-sm text-primary">
                  {profile.audienceSize ? `${profile.audienceSize.toLocaleString("pl-PL")} obserwujących` : "Nowa współpraca"}
                </div>
                {profile.socialLinks.length ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.socialLinks.slice(0, 2).map((link) => (
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
          ))
        )}
      </div>
    </section>
  );
}
