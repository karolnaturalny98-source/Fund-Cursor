"use client";

import type { HomeRanking } from "@/lib/queries/companies";
import { HomeRankingTable } from "@/components/home/home-ranking-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useFadeIn } from "@/lib/animations";
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
    <section id="ranking" className="container space-y-[clamp(1.5rem,2.5vw,2.75rem)]">
      <div ref={sectionAnim.ref} className={`flex flex-wrap gap-[clamp(0.85rem,1.8vw,1.5rem)] lg:flex-nowrap lg:items-end lg:justify-between ${sectionAnim.className}`}>
        <div className="w-full space-y-[clamp(0.85rem,1.6vw,1.35rem)] lg:w-auto">
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
        <Button asChild variant="premium-outline" className="fluid-button w-full rounded-full lg:w-auto">
          <Link href="/firmy">Zobacz pełny ranking</Link>
        </Button>
      </div>

      <Tabs defaultValue="top" className="space-y-6">
        <TabsList className="glass-panel flex w-full flex-wrap justify-start gap-[clamp(0.5rem,1vw,0.75rem)] p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-full border border-transparent px-[clamp(1.1rem,1.8vw,1.6rem)] py-[clamp(0.5rem,0.9vw,0.7rem)] text-[clamp(0.85rem,0.4vw+0.75rem,0.95rem)] font-semibold transition-all data-[state=active]:border-primary/50 data-[state=active]:bg-white/10 data-[state=active]:shadow-xs data-[state=inactive]:border-border/40 data-[state=inactive]:hover:border-primary/30 data-[state=inactive]:hover:bg-white/5"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            <p className="fluid-copy text-muted-foreground">{tab.description}</p>
            <HomeRankingTable companies={tab.companies} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
