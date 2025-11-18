import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Surface } from "@/components/ui/surface";
import { RankingTabsSection } from "@/components/rankings/ranking-tabs-section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HomeRankingTab } from "@/lib/types/rankings";

interface HomeRankingSectionProps {
  tabs: HomeRankingTab[];
}

export function HomeRankingSection({ tabs }: HomeRankingSectionProps) {
  if (!tabs.length) {
    return null;
  }

  return (
    <Section size="lg" className="relative">
      <Surface
        variant="panel"
        padding="md"
        className="relative flex flex-col gap-4 rounded-3xl border border-white/15 bg-gradient-to-br from-black/70 via-black/60 to-black/40"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <SectionHeader
              align="start"
              eyebrow="Rankingi FundedRank"
              title="Najlepsze firmy wg rankingu ogólnego"
              description="Aktualizacja 24h • oceniamy wyplaty, cashback i reputacje, aby pokazać tylko realnych liderów rynku prop trading."
            />

            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/60">
              <span>Aktualizacja co 24h</span>
              <span className="text-white/40">•</span>
              <span>Cashback verified</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/rankingi"
              prefetch={false}
              className={cn(
                buttonVariants({ variant: "primary", size: "sm" }),
                "rounded-full px-6 text-base font-semibold",
              )}
            >
              Zobacz ranking
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/rankingi#metodologia"
              prefetch={false}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10",
              )}
            >
              Metodologia
            </Link>
          </div>
        </div>

        <RankingTabsSection tabs={tabs} variant="home" />
      </Surface>
    </Section>
  );
}
