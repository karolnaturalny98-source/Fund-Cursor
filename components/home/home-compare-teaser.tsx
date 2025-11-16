import Link from "next/link";
import { ArrowRight, Layers, Percent, Receipt, Star } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { SurfaceCard } from "@/components/layout/surface-card";
import { buttonVariants } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { HomeRankingCompany } from "@/lib/queries/companies";
import { formatCurrencyLocalized } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface HomeCompareTeaserProps {
  companies: HomeRankingCompany[];
}

export function HomeCompareTeaser({ companies }: HomeCompareTeaserProps) {
  if (!companies || companies.length < 2) {
    return null;
  }

  const [first, second] = companies;

  return (
    <Section size="lg" stack="lg">
      <SurfaceCard
        variant="glass"
        padding="lg"
        className="flex flex-col gap-10 border border-border/40 bg-[var(--surface-muted)]/75"
      >
        <SectionHeader
          eyebrow="Porównywarka"
          title="Porównaj 2–3 firmy jednocześnie"
          description="W narzędziu Analizy ustawisz obok siebie parametry kont, zasady wypłat oraz opinie. Tu przykład mini porównania."
        />

        <div className="grid gap-6 md:grid-cols-2">
          <CompareCard company={first} />
          <CompareCard company={second} />
        </div>

        <div className="flex justify-center">
          <Link
            href="/analizy"
            prefetch={false}
            className={cn(buttonVariants({ variant: "primary" }), "rounded-full")}
          >
            Uruchom pełną porównywarkę
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </SurfaceCard>
    </Section>
  );
}

function CompareCard({ company }: { company: HomeRankingCompany }) {
  return (
    <SurfaceCard
      variant="glass"
      padding="md"
      className="flex flex-col gap-4 border border-border/40 bg-[var(--surface-muted)]/80"
    >
      <div className="flex items-center justify-between">
        <Text variant="body" weight="semibold">
          {company.name}
        </Text>
        <Text variant="caption" tone="muted">
          {company.country ?? "Międzynarodowa"}
        </Text>
      </div>
      <div className="flex flex-col gap-3 text-muted-foreground">
        <Text asChild variant="body">
          <div className="inline-flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Średnia ocena: {company.rating ? company.rating.toFixed(1) : "—"}
          </div>
        </Text>
        <Text asChild variant="body">
          <div className="inline-flex items-center gap-2">
            <Percent className="h-4 w-4 text-primary" />
            Cashback: {company.cashbackRate ? `${company.cashbackRate}%` : "—"}
          </div>
        </Text>
        <Text asChild variant="body">
          <div className="inline-flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            Plan od {company.maxPlanPriceUsd ? formatCurrencyLocalized(company.maxPlanPriceUsd, "USD", "pl-PL") : "—"}
          </div>
        </Text>
        <Text asChild variant="body">
          <div className="inline-flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            {company.reviewCount.toLocaleString("pl-PL")} opinii społeczności
          </div>
        </Text>
      </div>
    </SurfaceCard>
  );
}
