import Image from "next/image";
import Link from "next/link";

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
          <div className="inline-flex items-center border font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wider">
            Top Cashback
          </div>
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
    <Link 
      href={`/firmy/${company.slug}`} 
      className={cn(
        "snap-center shrink-0 flex flex-col items-center gap-2",
        "transition-all duration-300 hover:scale-105",
        "group"
      )}
    >
      {/* Logo */}
      <div className="relative h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 flex items-center justify-center">
        {company.logoUrl ? (
          <Image
            src={company.logoUrl}
            alt={`${company.name} logo`}
            width={96}
            height={96}
            className="object-contain w-full h-full rounded-xl"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full rounded-xl bg-primary/10">
            <span className="text-sm md:text-base font-semibold text-primary">
              {getInitials(company.name)}
            </span>
          </div>
        )}
      </div>

      {/* Cashback Range */}
      <div className="text-center">
        <p className="text-[9px] md:text-[10px] text-primary font-semibold leading-tight">
          ${company.minCashback} - ${company.maxCashback}
        </p>
      </div>
    </Link>
  );
}

