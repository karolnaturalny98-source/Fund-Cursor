import Link from "next/link";
import { Sparkles, Star, ArrowRight } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { SurfaceCard } from "@/components/layout/surface-card";
import { buttonVariants } from "@/components/ui/button";
import type { RecentCompanySummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HomeLatestCompaniesProps {
  companies: RecentCompanySummary[];
}

export function HomeLatestCompanies({ companies }: HomeLatestCompaniesProps) {
  if (!companies.length) {
    return null;
  }

  return (
    <Section size="lg" className="flex flex-col fluid-stack-lg">
      <SectionHeader
        eyebrow="Niedawno dodane firmy"
        title="Poznaj najnowsze prop firmy w bazie"
        description="Monitorujemy świeże listingi i od razu podpinamy cashback – możesz wskoczyć zanim zrobi to reszta rynku."
      />

      <div className="grid fluid-stack-md md:grid-cols-3">
        {companies.slice(0, 6).map((company) => (
          <SurfaceCard key={company.id} variant="muted" padding="md" className="flex h-full flex-col gap-4">
            <div className="flex items-center font-semibold uppercase tracking-wide text-muted-foreground fluid-stack-xs fluid-caption">
              <Sparkles className="h-4 w-4 text-primary" />
              Nowa firma
            </div>
            <div className="flex flex-col fluid-stack-2xs">
              <p className="font-semibold text-foreground fluid-copy">{company.name}</p>
              <p className="text-muted-foreground fluid-caption line-clamp-2">
                {company.shortDescription ?? "Sprawdź warunki kont, regulaminy i cashback."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between text-muted-foreground fluid-stack-xs fluid-caption">
              <div className="flex items-center fluid-stack-2xs">
                <Star className="h-3 w-3 text-amber-500" />
                {company.rating ? company.rating.toFixed(1) : "Brak ocen"}
              </div>
              <div className="font-medium text-foreground">
                Cashback: {company.cashbackRate ? `${company.cashbackRate}%` : "wkrótce"}
              </div>
            </div>
            <div className="flex flex-col fluid-stack-2xs border-t border-border/30 pt-4">
              <Link
                href={`/firmy/${company.slug}`}
                prefetch={false}
                className={cn(buttonVariants({ size: "sm" }), "w-full rounded-full inline-flex items-center gap-2")}
              >
                Przejdź z kodem
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-muted-foreground fluid-caption">
                Cashback dostępny po przejściu z naszego linka.
              </p>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </Section>
  );
}
