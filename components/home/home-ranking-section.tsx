import Link from "next/link";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { SurfaceCard } from "@/components/layout/surface-card";
import { Button } from "@/components/ui/button";
import { RankingTabsSection } from "@/components/rankings/ranking-tabs-section";
import type { HomeRankingTab } from "@/lib/types/rankings";

interface HomeRankingSectionProps {
  tabs: HomeRankingTab[];
}

export function HomeRankingSection({ tabs }: HomeRankingSectionProps) {
  if (!tabs.length) {
    return null;
  }

  return (
    <Section size="lg" className="relative flex flex-col gap-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          align="start"
          eyebrow="Rankingi"
          title="Najważniejsze zestawienia"
          description="Jeden widok, wiele rankingów: reputacja, cashback, cena wejścia i doświadczenie wypłat. Każda zakładka to 10 najlepszych firm w danej kategorii."
        />
        <Button asChild variant="outline" className="rounded-full border-border/60 text-foreground">
          <Link href="/rankingi" prefetch={false}>
            Przejdź do pełnego rankingu →
          </Link>
        </Button>
      </div>

      <SurfaceCard variant="glass" padding="lg" className="border border-border/40">
        <RankingTabsSection tabs={tabs} variant="home" />
      </SurfaceCard>
    </Section>
  );
}
