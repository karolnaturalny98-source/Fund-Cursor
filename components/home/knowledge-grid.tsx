"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";
import { KnowledgeGridButtonClient } from "./knowledge-grid-client";
import { cn } from "@/lib/utils";

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
    <Section
      ref={sectionVisible.ref}
      className="flex flex-col fluid-stack-xl"
      id="baza-wiedzy"
      size="lg"
    >
      <div
        ref={sectionAnim.ref}
        className={cn(
          "flex flex-wrap gap-[clamp(0.85rem,1.6vw,1.5rem)] sm:flex-nowrap sm:items-end sm:justify-between",
          sectionAnim.className,
        )}
      >
        <div className="flex w-full flex-col fluid-stack-xs sm:w-auto">
          <p className="fluid-eyebrow text-primary">
            Baza wiedzy
          </p>
          <h2 className="fluid-h2 font-semibold text-foreground">
            Ucz się razem ze społecznością FundedRank
          </h2>
          <p className="fluid-copy max-w-2xl text-muted-foreground">
            Pracujemy nad pełnym centrum wiedzy dla traderów. Poniżej znajdziesz
            tematy, nad którymi aktualnie pracujemy — daj znać, które chcesz
            przeczytać jako pierwsze.
          </p>
        </div>
        <Button variant="premium-outline" className="fluid-button w-full rounded-full sm:w-auto">
          Zgłoś temat artykułu
        </Button>
      </div>

      <div className="grid fluid-stack-lg md:grid-cols-3">
        {knowledgeItems.map((item, index) => (
          <Card
            key={item.title}
            className={`group relative overflow-hidden rounded-3xl border border-border/60 transition-all duration-700 hover:border-primary/50 hover:shadow-md delay-[var(--delay)] ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
          >
            <CardHeader>
              <CardTitle className="text-[clamp(1.1rem,0.6vw+0.95rem,1.3rem)] font-semibold text-foreground">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col fluid-stack-md">
              <p className="fluid-copy text-muted-foreground">{item.description}</p>
              <KnowledgeGridButtonClient />
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
