import Link from "next/link";
import { ArrowRight, Layers, Percent, Receipt, Star } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { HomeRankingCompany } from "@/lib/queries/companies";
import { formatCurrencyLocalized } from "@/lib/currency";

interface HomeCompareTeaserProps {
  companies: HomeRankingCompany[];
}

export function HomeCompareTeaser({ companies }: HomeCompareTeaserProps) {
  if (!companies || companies.length < 2) {
    return null;
  }

  const [first, second] = companies;

  return (
    <section className="relative border-t border-b border-border/60 bg-card/70">
      <div className="container flex flex-col gap-8 py-[clamp(2rem,3vw,3rem)]">
        <div className="flex flex-col gap-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Porównywarka
          </p>
          <h2 className="fluid-h2 font-semibold text-foreground">Porównaj 2–3 firmy jednocześnie</h2>
          <p className="text-sm text-muted-foreground">
            W narzędziu Analizy ustawisz obok siebie parametry kont, zasady wypłat oraz opinie. Tu przykład mini porównania.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <CompareCard company={first} />
          <CompareCard company={second} />
        </div>

        <div className="flex justify-center">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/analizy" prefetch={false}>
              Uruchom pełną porównywarkę
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function CompareCard({ company }: { company: HomeRankingCompany }) {
  return (
    <Card className="border border-border/50 bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <span>{company.name}</span>
          <span className="text-xs text-muted-foreground">{company.country ?? "Międzynarodowa"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          Średnia ocena: {company.rating ? company.rating.toFixed(1) : "—"}
        </div>
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-primary" />
          Cashback: {company.cashbackRate ? `${company.cashbackRate}%` : "—"}
        </div>
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          Plan od {company.maxPlanPriceUsd ? formatCurrencyLocalized(company.maxPlanPriceUsd, "USD", "pl-PL") : "—"}
        </div>
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          {company.reviewCount.toLocaleString("pl-PL")} opinii społeczności
        </div>
      </CardContent>
    </Card>
  );
}
