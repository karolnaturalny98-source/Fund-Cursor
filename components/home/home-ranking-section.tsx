import Link from "next/link";

import { Section } from "@/components/layout/section";
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
    <Section size="lg" className="flex flex-col fluid-stack-lg">
      <div className="flex flex-col fluid-stack-md sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col fluid-stack-sm">
          <p className="font-semibold uppercase tracking-[0.35em] text-muted-foreground fluid-caption">
            Rankingi
          </p>
          <h2 className="fluid-h2 font-semibold text-foreground">Najważniejsze zestawienia</h2>
          <p className="max-w-2xl text-muted-foreground fluid-copy">
            Jeden widok, wiele rankingów: reputacja, cashback, cena wejścia i doświadczenie wypłat. Każda zakładka to 10 najlepszych firm w danej kategorii.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/rankingi" prefetch={false}>
            Przejdź do pełnego rankingu →
          </Link>
        </Button>
      </div>

      <RankingTabsSection tabs={tabs} variant="home" />
    </Section>
  );
}
