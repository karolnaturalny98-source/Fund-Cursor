import Link from "next/link";
import { Sparkles, Star, ArrowRight } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { SurfaceCard } from "@/components/layout/surface-card";
import { buttonVariants } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
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
    <Section size="lg" stack="lg">
      <SectionHeader
        eyebrow="Niedawno dodane firmy"
        title="Poznaj najnowsze prop firmy w bazie"
        description="Monitorujemy świeże listingi i od razu podpinamy cashback – możesz wskoczyć zanim zrobi to reszta rynku."
      />

      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        {companies.slice(0, 6).map((company) => (
          <SurfaceCard key={company.id} variant="muted" padding="md" className="flex h-full flex-col gap-4">
            <Text
              asChild
              variant="caption"
              tone="muted"
              weight="semibold"
              className="flex items-center gap-2 uppercase tracking-wide"
            >
              <div>
                <Sparkles className="h-4 w-4 text-primary" />
                Nowa firma
              </div>
            </Text>
            <div className="flex flex-col gap-2">
              <Text variant="body" weight="semibold" className="text-foreground">
                {company.name}
              </Text>
              <Text variant="caption" tone="muted" className="line-clamp-2">
                {company.shortDescription ?? "Sprawdź warunki kont, regulaminy i cashback."}
              </Text>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Text
                asChild
                variant="caption"
                tone="muted"
                className="flex items-center gap-2 text-muted-foreground"
              >
                <div>
                  <Star className="h-3 w-3 text-amber-500" />
                  {company.rating ? company.rating.toFixed(1) : "Brak ocen"}
                </div>
              </Text>
              <Text variant="caption" tone="default" weight="medium" className="text-foreground">
                Cashback: {company.cashbackRate ? `${company.cashbackRate}%` : "wkrótce"}
              </Text>
            </div>
            <div className="flex flex-col gap-2 border-t border-border/30 pt-4">
              <Link
                href={`/firmy/${company.slug}`}
                prefetch={false}
                className={cn(buttonVariants({ size: "sm" }), "w-full rounded-full inline-flex items-center gap-2")}
              >
                Przejdź z kodem
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Text variant="caption" tone="muted">
                Cashback dostępny po przejściu z naszego linka.
              </Text>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </Section>
  );
}
