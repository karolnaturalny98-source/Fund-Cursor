import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TopCashbackCompany } from "@/lib/types";
import { cn } from "@/lib/utils";

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
    <section className="relative">
      <div className="container space-y-3">
        {/* Section Header Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="fluid-badge font-semibold tracking-[0.28em]">
            Top Cashback
          </Badge>
        </div>

        {/* Cards Container */}
        <div className="relative">
          {/* Mobile: Horizontal Scroll - zachowaj spójny wygląd */}
          <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide md:hidden">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          {/* Tablet+: Grid z zachowaniem proporcji - używa auto-fit dla płynnego skalowania */}
          <div className="hidden md:grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 md:gap-4 justify-items-center max-w-full">
            {companies.slice(0, 8).map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CompanyCard({ company }: { company: TopCashbackCompany }) {
  return (
    <Card className="snap-center shrink-0 w-[clamp(8.5rem,24vw,10.5rem)] border-border/60 bg-card/72 backdrop-blur-[36px]! transition-transform duration-300 hover:scale-105">
      <CardContent className="p-[clamp(1rem,2vw,1.35rem)]">
        <Link
          href={`/firmy/${company.slug}`}
          className={cn(
            "group flex flex-col items-center gap-[clamp(0.5rem,1.5vw,0.75rem)]",
            "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <div className="relative flex h-[clamp(3.5rem,4vw+2.5rem,5.25rem)] w-[clamp(3.5rem,4vw+2.5rem,5.25rem)] items-center justify-center rounded-xl">
            {company.logoUrl ? (
              <Image
                src={company.logoUrl}
                alt={`${company.name} logo`}
                width={96}
                height={96}
                className="h-full w-full rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-primary/10">
                <span className="text-[clamp(0.75rem,0.5vw+0.65rem,0.95rem)] font-semibold text-primary">
                  {getInitials(company.name)}
                </span>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-[clamp(0.65rem,0.3vw+0.55rem,0.78rem)] font-semibold leading-tight text-primary">
              ${company.minCashback} - ${company.maxCashback}
            </p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

