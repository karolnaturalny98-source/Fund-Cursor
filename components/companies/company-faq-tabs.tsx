"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaqItem } from "@/components/companies/faq-item";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { Search } from "lucide-react";

interface CompanyFaqTabsProps {
  faqs: { id: string; question: string; answer: string }[];
  companySlug: string;
}

type FaqCategory = {
  id: string;
  label: string;
  hint?: string;
  match: RegExp;
};

const FAQ_CATEGORIES: FaqCategory[] = [
  { id: "all", label: "Wszystkie", match: /.*/ },
  { id: "payouts", label: "Wyplaty", match: /(wyplat|payout|withdraw)/i },
  { id: "challenge", label: "Challenge", match: /(challenge|etap|verification|step)/i },
  { id: "account", label: "Konto", match: /(konto|account|login|panel)/i },
  { id: "trading", label: "Trading", match: /(handel|instrument|platform|lot|drawdown)/i },
  { id: "other", label: "Inne", match: /.*/ },
];

export function CompanyFaqTabs({ faqs, companySlug }: CompanyFaqTabsProps) {
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");

  const categorizedFaqs = useMemo(() => {
    const groups: Record<string, typeof faqs> = {
      all: faqs,
      payouts: [],
      challenge: [],
      account: [],
      trading: [],
      other: [],
    };

    faqs.forEach((faq) => {
      const text = `${faq.question} ${faq.answer}`.toLowerCase();
      const matchedCategory =
        FAQ_CATEGORIES.find((category) => category.id !== "all" && category.id !== "other" && category.match.test(text))?.id ??
        "other";
      (groups[matchedCategory] ?? groups.other).push(faq);
    });

    return groups;
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    const baseline = active === "all" ? faqs : categorizedFaqs[active] ?? [];
    if (!query.trim()) {
      return baseline;
    }
    const lowered = query.trim().toLowerCase();
    return baseline.filter(
      (faq) =>
        faq.question.toLowerCase().includes(lowered) || faq.answer.toLowerCase().includes(lowered),
    );
  }, [active, categorizedFaqs, faqs, query]);

  if (!faqs.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
        Brak pytan FAQ dla tej firmy.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Szukaj w FAQ..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="rounded-full border border-border/60 bg-[rgba(12,14,18,0.6)] backdrop-blur-[36px]! pl-9 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Kategorie:</span>
        {FAQ_CATEGORIES.map((category) => {
          const count =
            category.id === "all"
              ? faqs.length
              : category.id === "other"
                ? categorizedFaqs.other.length
                : categorizedFaqs[category.id]?.length ?? 0;

          return (
            <Button
              key={category.id}
              variant={active === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActive(category.id)}
              className="h-7 rounded-full px-2.5 text-[11px] font-normal"
            >
              {category.label}
              <PremiumBadge variant={active === category.id ? "glow" : "outline-solid"} className="ml-1.5 rounded-full text-[10px] font-semibold">
                {count}
              </PremiumBadge>
            </Button>
          );
        })}
      </div>

      {filteredFaqs.length ? (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} data-testid="faq-item">
              <FaqItem id={faq.id} question={faq.question} answer={faq.answer} companySlug={companySlug} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground shadow-xs bg-[rgba(10,12,15,0.72)]!">
          Brak wynikow dla wybranej kategorii i zapytania.
        </div>
      )}
    </div>
  );
}
