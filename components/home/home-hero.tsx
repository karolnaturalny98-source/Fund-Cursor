import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Search, Shield, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HomepageMetrics } from "@/lib/types";

interface HomeHeroProps {
  metrics: HomepageMetrics;
}

export function HomeHero({ metrics }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="container flex flex-col gap-8 py-[clamp(2.5rem,4vw,4rem)]">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            FundedRank
          </div>
          <div className="space-y-4">
            <h1 className="fluid-h1 font-bold tracking-tight text-foreground">
              Znajdź najlepszą prop firmę i zgarnij cashback
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground">
              W jednym miejscu porównasz warunki, opinie społeczności i aktualne promocje.
              Prowadzimy listy wypłat, ranking cashbacku oraz zestawienie nowych firm.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Wyszukaj firmę po nazwie</span>
            </div>
            <form action="/firmy" className="flex flex-1 gap-2" role="search">
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

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/rankingi" prefetch={false}>
                Zobacz rankingi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="premium-outline" size="lg" className="rounded-full">
              <Link href="/sklep" prefetch={false}>
                Kup konto z cashbackiem
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href="/analizy" prefetch={false}>
                Porównaj firmy
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-border/40 bg-card/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <HeroStat label="Firm w bazie" value={`${metrics.totalCompanies.toLocaleString("pl-PL")}+`} icon={<Shield className="h-4 w-4" />} />
          <HeroStat label="Wypłacony cashback" value={`$${metrics.totalCashbackPaid.toLocaleString("en-US")}`} icon={<ArrowRight className="h-4 w-4" />} />
          <HeroStat label="Zweryfikowane opinie" value={metrics.totalReviews.toLocaleString("pl-PL")} icon={<Star className="h-4 w-4" />} />
          <HeroStat label="Średnia ocena" value={metrics.avgRating.toFixed(1)} icon={<Star className="h-4 w-4 text-amber-500" />} />
        </div>
      </div>
    </section>
  );
}

interface HeroStatProps {
  label: string;
  value: string;
  icon: ReactNode;
}

function HeroStat({ label, value, icon }: HeroStatProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
