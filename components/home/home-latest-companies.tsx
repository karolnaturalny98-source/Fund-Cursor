import Link from "next/link";
import { Sparkles, Star, ArrowRight } from "lucide-react";

import { Section } from "@/components/layout/section";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RecentCompanySummary } from "@/lib/types";

interface HomeLatestCompaniesProps {
  companies: RecentCompanySummary[];
}

export function HomeLatestCompanies({ companies }: HomeLatestCompaniesProps) {
  if (!companies.length) {
    return null;
  }

  return (
    <Section size="lg" className="space-y-6">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Niedawno dodane firmy
        </p>
        <h2 className="fluid-h2 font-semibold text-foreground">Poznaj najnowsze prop firmy w bazie</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {companies.slice(0, 6).map((company) => (
          <Card key={company.id} className="flex h-full flex-col border border-border/40 bg-background/60">
            <CardContent className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Nowa firma
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{company.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {company.shortDescription ?? "Sprawdź warunki kont, regulaminy i cashback."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500" />
                  {company.rating ? company.rating.toFixed(1) : "Brak ocen"}
                </div>
                <div className="font-medium text-foreground">
                  Cashback: {company.cashbackRate ? `${company.cashbackRate}%` : "wkrótce"}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/30 p-4">
              <div className="flex w-full flex-col gap-1">
                <Button asChild size="sm" className="w-full rounded-full">
                  <Link href={`/firmy/${company.slug}`} prefetch={false} className="inline-flex items-center gap-2">
                    Przejdź z kodem
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  Cashback dostępny po przejściu z naszego linka.
                </p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  );
}
