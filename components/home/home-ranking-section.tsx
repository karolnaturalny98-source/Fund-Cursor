import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section } from "@/components/layout/section";
import { Surface } from "@/components/ui/surface";
import { RankingTabsSection } from "@/components/rankings/ranking-tabs-section";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
              <Badge variant="hero" className="border-white/15 bg-white/5 text-[0.6rem] text-white/70">
                Ranking live
              </Badge>
              <span className="text-white/40">•</span>
              <span>Refresh 24h</span>
              <span className="text-white/40">•</span>
              <span>Cashback verified</span>
            </div>
            <p className="text-sm text-white/65">
              Tylko aktywne firmy prop z udokumentowanymi wypłatami i cashbackiem – wybierz zakładkę i sprawdź top listę.
            </p>
          </div>

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
        </div>

        <RankingTabsSection tabs={tabs} variant="home" />
      </Surface>
    </Section>
  );
}
