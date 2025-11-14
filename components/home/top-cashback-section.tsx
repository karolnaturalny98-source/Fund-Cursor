import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/layout/section";
import type { TopCashbackCompany } from "@/lib/types";

interface TopCashbackSectionProps {
  companies: TopCashbackCompany[];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

export function TopCashbackSection({ companies }: TopCashbackSectionProps) {
  if (companies.length === 0) {
    return null;
  }

  return (
    <Section size="md" className="relative flex flex-col fluid-stack-lg">
      <div className="flex flex-col fluid-stack-sm">
        {/* Section Header Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="fluid-badge font-semibold tracking-[0.28em] fluid-caption">
            Top Cashback
          </Badge>
        </div>

        {/* Cards Container */}
        <div className="relative">
          {/* Mobile: Horizontal Scroll - zachowaj spójny wygląd */}
          <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide fluid-stack-sm md:hidden">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          {/* Tablet+: Grid z zachowaniem proporcji - używa auto-fit dla płynnego skalowania */}
          <div className="hidden max-w-full grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] justify-items-center fluid-stack-sm md:grid">
            {companies.slice(0, 8).map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function CompanyCard({ company }: { company: TopCashbackCompany }) {
  return (
    <Card className="snap-center w-[clamp(10rem,24vw,12rem)] shrink-0 border-border/60 bg-card/80 backdrop-blur">
      <CardContent className="flex flex-col items-center text-center fluid-stack-sm p-4">
        <div className="relative flex h-[clamp(3.5rem,4vw+2.5rem,5.25rem)] w-[clamp(3.5rem,4vw+2.5rem,5.25rem)] items-center justify-center rounded-xl border border-border/30 bg-background">
          {company.logoUrl ? (
            <Image
              src={company.logoUrl}
              alt={`${company.name} logo`}
              width={96}
              height={96}
              className="h-full w-full rounded-xl object-contain"
            />
          ) : (
            <span className="font-semibold text-primary fluid-copy">{getInitials(company.name)}</span>
          )}
        </div>
        <div className="flex flex-col fluid-stack-2xs">
          <p className="font-semibold text-foreground fluid-copy">{company.name}</p>
          <p className="text-muted-foreground fluid-caption">
            ${company.minCashback} - ${company.maxCashback} cashback
          </p>
        </div>
        <Button asChild size="sm" className="w-full rounded-full">
          <Link href={`/firmy/${company.slug}`} prefetch={false}>
            Odbierz cashback
          </Link>
        </Button>
        <p className="text-muted-foreground fluid-caption">Przejdź z kodem, a część naszej prowizji wróci do Ciebie.</p>
      </CardContent>
    </Card>
  );
}
