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
          <Badge variant="outline" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            Top Cashback
          </Badge>
        </div>

        {/* Cards Container */}
        <div className="relative">
          {/* Mobile: Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide md:hidden">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          {/* Tablet: 4 Column Grid */}
          <div className="hidden md:grid lg:hidden grid-cols-4 gap-4">
            {companies.slice(0, 8).map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          {/* Desktop: 8 Column Grid */}
          <div className="hidden lg:grid grid-cols-8 gap-4">
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
    <Card className="snap-center shrink-0 border-border/60 bg-card/72 backdrop-blur-[36px]! transition-transform duration-300 hover:scale-105">
      <CardContent className="p-4 sm:p-5">
        <Link
          href={`/firmy/${company.slug}`}
          className={cn(
            "group flex flex-col items-center gap-2",
            "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <div className="relative flex h-16 w-16 items-center justify-center rounded-xl md:h-20 md:w-20 lg:h-24 lg:w-24">
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
                <span className="text-sm font-semibold text-primary md:text-base">
                  {getInitials(company.name)}
                </span>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-[9px] font-semibold leading-tight text-primary md:text-[10px]">
              ${company.minCashback} - ${company.maxCashback}
            </p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

