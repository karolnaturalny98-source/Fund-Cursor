"use client";

import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";
import { KnowledgeGridButtonClient } from "./knowledge-grid-client";

const knowledgeItems = [
  {
    title: "Porównanie modeli fundingowych 2025",
    description:
      "Które konta evaluation są najbardziej opłacalne, a kiedy warto przejść na model instant?",
    href: "#",
  },
  {
    title: "Checklist przed zakupem konta",
    description:
      "10 punktów, które warto sprawdzić w regulaminie firmy prop tradingowej przed pierwszą wpłatą.",
    href: "#",
  },
  {
    title: "Case study: cashback w praktyce",
    description:
      "Jak trader zebrał 380 pkt cashback i wymienił je na kolejne konto 100K bez dodatkowych kosztów.",
    href: "#",
  },
];

export function KnowledgeGrid() {
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });
  const sectionVisible = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(knowledgeItems.length, 100);
  const visibleStaggerItems = sectionVisible.isVisible ? staggerItems : new Array(knowledgeItems.length).fill(false);

  return (
    <section ref={sectionVisible.ref} className="container space-y-6" id="baza-wiedzy">
      <div ref={sectionAnim.ref} className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${sectionAnim.className}`}>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            Baza wiedzy
          </p>
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Ucz się razem ze społecznością FundedRank
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Pracujemy nad pełnym centrum wiedzy dla traderów. Poniżej znajdziesz
            tematy, nad którymi aktualnie pracujemy — daj znać, które chcesz
            przeczytać jako pierwsze.
          </p>
        </div>
        <Button variant="premium-outline" className="h-11 rounded-full px-6 text-sm">
          Zgłoś temat artykułu
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {knowledgeItems.map((item, index) => (
          <Card
            key={item.title}
            className={`group relative overflow-hidden rounded-3xl border border-border/60 transition-all hover:border-primary/50 hover:shadow-md ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
            className="transition-all duration-700 delay-[var(--delay)]"
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <KnowledgeGridButtonClient />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
