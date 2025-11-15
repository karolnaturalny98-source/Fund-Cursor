import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { SurfaceCard } from "@/components/layout/surface-card";
import { cn } from "@/lib/utils";
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
    <Section size="md" className="relative flex flex-col gap-8">
      <SectionHeader
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 font-semibold uppercase tracking-[0.28em]">
              Top Cashback
            </Badge>
            Live
          </span>
        }
        title="Najwyższe stawki cashbacku"
        description="Filtrujemy realtime zgłoszenia cashbacków. Zobacz firmy, które w tym tygodniu płacą najwięcej."
      />
      <div
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3"
        aria-label="Top cashback – przewiń listę firm"
      >
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            className="snap-center min-w-[220px]"
          />
        ))}
      </div>
    </Section>
  );
}

function CompanyCard({ company, className }: { company: TopCashbackCompany; className?: string }) {
  return (
    <SurfaceCard
      variant="glass"
      padding="sm"
      className={cn(
        "flex flex-col items-center text-center gap-3 border border-white/10 bg-[#090909]",
        className,
      )}
    >
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-border/40 bg-[var(--surface-base)]">
        {company.logoUrl ? (
          <Image
            src={company.logoUrl}
            alt={`${company.name} logo`}
            width={96}
            height={96}
            className="h-full w-full rounded-2xl object-contain"
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
      <Button asChild size="sm" className="w-full rounded-full border border-white/20 bg-transparent text-white">
        <Link href={`/firmy/${company.slug}`} prefetch={false}>
          Odbierz cashback
        </Link>
      </Button>
      <p className="text-muted-foreground fluid-caption">
        Przejdź z kodem, a część naszej prowizji wróci do Ciebie.
      </p>
    </SurfaceCard>
  );
}
