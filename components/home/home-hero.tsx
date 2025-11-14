import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Search, Shield, Star } from "lucide-react";

import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HomepageMetrics } from "@/lib/types";

interface HomeHeroProps {
  metrics: HomepageMetrics;
}

export function HomeHero({ metrics }: HomeHeroProps) {
  return (
    <Section size="lg" className="relative overflow-hidden border-b border-border/60">
      <div className="flex flex-col fluid-stack-xl">
        <div className="flex flex-col fluid-stack-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1 font-semibold uppercase tracking-[0.3em] text-muted-foreground fluid-caption">
            FundedRank
          </div>
          <div className="flex flex-col fluid-stack-md">
            <h1 className="fluid-h1 font-bold tracking-tight text-foreground">
              Znajdź najlepszą prop firmę i zgarnij cashback
            </h1>
            <p className="max-w-3xl text-muted-foreground fluid-copy">
              W jednym miejscu porównasz warunki, opinie społeczności i aktualne promocje.
              Prowadzimy listy wypłat, ranking cashbacku oraz zestawienie nowych firm.
            </p>
          </div>

          <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-center fluid-stack-xs">
              <Search className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground fluid-copy">Wyszukaj firmę po nazwie</span>
            </div>
            <form action="/firmy" className="flex flex-1 fluid-stack-xs" role="search">
              <Input
                name="search"
                placeholder="np. Funding Pips"
                aria-label="Szukaj firmy"
                className="flex-1 rounded-full bg-card/70"
              />
              <Button type="submit" className="rounded-full">
                Szukaj
              </Button>
            </form>
          </div>

          <div className="flex flex-wrap fluid-stack-xs">
            <Button asChild className="rounded-full">
              <Link href="/rankingi" prefetch={false}>
                Zobacz rankingi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="premium-outline" className="rounded-full">
              <Link href="/sklep" prefetch={false}>
                Kup konto z cashbackiem
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/analizy" prefetch={false}>
                Porównaj firmy
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid fluid-stack-md rounded-2xl border border-border/40 bg-card/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <HeroStat label="Firm w bazie" value={`${metrics.totalCompanies.toLocaleString("pl-PL")}+`} icon={<Shield className="h-4 w-4" />} />
          <HeroStat label="Wypłacony cashback" value={`$${metrics.totalCashbackPaid.toLocaleString("en-US")}`} icon={<ArrowRight className="h-4 w-4" />} />
          <HeroStat label="Zweryfikowane opinie" value={metrics.totalReviews.toLocaleString("pl-PL")} icon={<Star className="h-4 w-4" />} />
          <HeroStat label="Średnia ocena" value={metrics.avgRating.toFixed(1)} icon={<Star className="h-4 w-4 text-amber-500" />} />
        </div>
      </div>
    </Section>
  );
}

interface HeroStatProps {
  label: string;
  value: string;
  icon: ReactNode;
}

function HeroStat({ label, value, icon }: HeroStatProps) {
  return (
    <div className="flex items-center fluid-stack-sm rounded-xl border border-border/40 bg-background/60 px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex flex-col fluid-stack-2xs">
        <p className="uppercase tracking-wide text-muted-foreground fluid-caption">{label}</p>
        <p className="font-semibold text-foreground fluid-lead">{value}</p>
      </div>
    </div>
  );
}
