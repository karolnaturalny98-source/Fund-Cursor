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
    <section id="ranking" className="container space-y-6">
      <div ref={sectionAnim.ref} className={`flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between ${sectionAnim.className}`}>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            Ranking premium
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Wybierz najlepszą firmę dla swojego stylu
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Porównujemy modele kont, zasady i cashback. Zmieniaj zakładkę, aby
            zobaczyć firmy wyróżnione przez społeczność.
          </p>
        </div>
        <Button asChild variant="premium-outline" className="h-11 rounded-full px-6 text-sm">
          <Link href="/firmy">Zobacz pełny ranking</Link>
        </Button>
      </div>

      <Tabs defaultValue="top" className="space-y-6">
        <TabsList className="glass-panel flex w-full flex-wrap justify-start gap-2 p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-full border border-transparent px-5 py-2 text-sm font-semibold transition-all data-[state=active]:border-primary/50 data-[state=active]:bg-white/10 data-[state=active]:shadow-xs data-[state=inactive]:border-border/40 data-[state=inactive]:hover:border-primary/30 data-[state=inactive]:hover:bg-white/5"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            <p className="text-sm text-muted-foreground">{tab.description}</p>
            <HomeRankingTable companies={tab.companies} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
