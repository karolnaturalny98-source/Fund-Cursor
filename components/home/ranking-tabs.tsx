"use client";

import type { HomeRanking } from "@/lib/queries/companies";
import { HomeRankingTable } from "@/components/home/home-ranking-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";
import { useFadeIn } from "@/lib/animations";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function RankingTabs({ ranking }: { ranking: HomeRanking }) {
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });
  
  const tabs = [
    {
      value: "top",
      label: "Najwyższe oceny",
      description: "Firmy z najwyższą średnią ocen społeczności.",
      companies: ranking.topRated.slice(0, 10),
    },
    {
      value: "cashback",
      label: "Najlepszy cashback",
      description: "Najwyższe stawki cashbacku i programy partnerskie.",
      companies: ranking.topCashback.slice(0, 10),
    },
    {
      value: "new",
      label: "Nowości",
      description: "Najnowsze firmy dodane do FundedRank.",
      companies: ranking.newest.slice(0, 10),
    },
  ];

  return (
    <Section
      id="ranking"
      size="lg"
      className="flex flex-col fluid-stack-xl"
    >
      <div
        ref={sectionAnim.ref}
        className={cn(
          "flex flex-wrap items-start gap-[clamp(0.85rem,1.8vw,1.5rem)] lg:flex-nowrap lg:items-end lg:justify-between",
          sectionAnim.className,
        )}
      >
        <div className="flex w-full flex-col fluid-stack-sm lg:w-auto">
          <p className="fluid-eyebrow text-primary">
            Ranking premium
          </p>
          <h2 className="fluid-h2 font-semibold tracking-tight text-foreground">
            Wybierz najlepszą firmę dla swojego stylu
          </h2>
          <p className="fluid-copy max-w-2xl text-muted-foreground">
            Porównujemy modele kont, zasady i cashback. Zmieniaj zakładkę, aby
            zobaczyć firmy wyróżnione przez społeczność.
          </p>
        </div>
        <Button asChild variant="ghost-dark" className="fluid-button w-full rounded-full lg:w-auto">
          <Link href="/firmy">Zobacz pełny ranking</Link>
        </Button>
      </div>

      <Tabs defaultValue="top" className="flex flex-col fluid-stack-md">
        <TabsList className="glass-panel card-outline flex w-full flex-wrap justify-start fluid-stack-sm p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-full border border-white/10 bg-black/40 px-[clamp(1.1rem,1.8vw,1.6rem)] py-[clamp(0.5rem,0.9vw,0.7rem)] text-[clamp(0.85rem,0.4vw+0.75rem,0.95rem)] font-semibold text-muted-foreground transition-all data-[state=active]:border-white/50 data-[state=active]:bg-white text-foreground data-[state=active]:shadow-[0_15px_35px_-25px_rgba(255,255,255,0.9)] data-[state=inactive]:hover:border-white/25 data-[state=inactive]:hover:text-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="flex flex-col fluid-stack-sm">
            <p className="fluid-copy text-muted-foreground">{tab.description}</p>
            <HomeRankingTable companies={tab.companies} />
          </TabsContent>
        ))}
      </Tabs>
    </Section>
  );
}
