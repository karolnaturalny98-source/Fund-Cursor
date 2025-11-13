import { Metadata } from "next";
import { Suspense } from "react";
import { BarChart3, TrendingUp, FileText, Award } from "lucide-react";

import { getCompanyOptions } from "@/lib/queries/companies";
import { CompanySelector } from "@/components/analysis/company-selector";
import { CompanySelectorSkeleton } from "@/components/analysis/loading-skeleton";
import { AuroraWrapper } from "@/components/aurora-wrapper";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Analizy Firm | FundedRank",
  description:
    "Zaawansowane narzędzie do porównywania firm prop tradingowych. Analizuj ceny, plany, opinie i wiele więcej.",
};

async function CompanySelectorWrapper() {
  const companies = await getCompanyOptions();
  return <CompanySelector companies={companies} />;
}

export default async function AnalizyPage() {
  return (
    <div className="relative">
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 h-[150vh]">
        <AuroraWrapper
          colorStops={["#34D399", "#a78bfa", "#3b82f6"]}
          blend={0.35}
          amplitude={0.7}
          speed={0.5}
        />
      </div>

      <Section size="lg" className="animate-in fade-in duration-500 flex flex-col fluid-stack-xl">
        {/* Hero Section */}
        <div className="flex flex-col fluid-stack-lg text-center">
          <div className="inline-flex items-center gap-[clamp(0.5rem,0.75vw,0.65rem)] rounded-full border border-border/60 bg-card/72 px-[clamp(1rem,1.4vw,1.2rem)] py-[clamp(0.5rem,0.75vw,0.65rem)] font-medium text-primary shadow-xs backdrop-blur-[36px]!">
            <BarChart3 className="h-[clamp(1.05rem,0.6vw+0.9rem,1.25rem)] w-[clamp(1.05rem,0.6vw+0.9rem,1.25rem)]" />
            Narzędzie Analityczne
          </div>

          <h1 className="font-bold tracking-tight text-foreground fluid-h1">
            Zaawansowana Analiza Firm
          </h1>

          <p className="mx-auto max-w-2xl text-muted-foreground fluid-copy">
            Porównaj do 3 firm prop tradingowych jednocześnie. Analizuj ceny planów,
            warunki handlowe, opinie użytkowników i metryki wydajności w jednym miejscu.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-[clamp(0.65rem,0.9vw,0.8rem)]">
            <div className="flex items-center gap-[clamp(0.5rem,0.75vw,0.65rem)] rounded-full border border-border/60 bg-card/72 px-[clamp(1rem,1.4vw,1.2rem)] py-[clamp(0.5rem,0.75vw,0.65rem)] text-primary shadow-xs transition-all hover:bg-card/82 backdrop-blur-[36px]! fluid-caption">
              <TrendingUp className="h-[clamp(1.05rem,0.6vw+0.9rem,1.25rem)] w-[clamp(1.05rem,0.6vw+0.9rem,1.25rem)] text-primary" />
              <span>Wykresy cenowe</span>
            </div>
            <div className="flex items-center gap-[clamp(0.5rem,0.75vw,0.65rem)] rounded-full border border-border/60 bg-card/72 px-[clamp(1rem,1.4vw,1.2rem)] py-[clamp(0.5rem,0.75vw,0.65rem)] text-primary shadow-xs transition-all hover:bg-card/82 backdrop-blur-[36px]! fluid-caption">
              <FileText className="h-[clamp(1.05rem,0.6vw+0.9rem,1.25rem)] w-[clamp(1.05rem,0.6vw+0.9rem,1.25rem)] text-primary" />
              <span>Porównanie planów</span>
            </div>
            <div className="flex items-center gap-[clamp(0.5rem,0.75vw,0.65rem)] rounded-full border border-border/60 bg-card/72 px-[clamp(1rem,1.4vw,1.2rem)] py-[clamp(0.5rem,0.75vw,0.65rem)] text-primary shadow-xs transition-all hover:bg-card/82 backdrop-blur-[36px]! fluid-caption">
              <Award className="h-[clamp(1.05rem,0.6vw+0.9rem,1.25rem)] w-[clamp(1.05rem,0.6vw+0.9rem,1.25rem)] text-primary" />
              <span>Analiza opinii</span>
            </div>
            <div className="flex items-center gap-[clamp(0.5rem,0.75vw,0.65rem)] rounded-full border border-border/60 bg-card/72 px-[clamp(1rem,1.4vw,1.2rem)] py-[clamp(0.5rem,0.75vw,0.65rem)] text-primary shadow-xs transition-all hover:bg-card/82 backdrop-blur-[36px]! fluid-caption">
              <BarChart3 className="h-[clamp(1.05rem,0.6vw+0.9rem,1.25rem)] w-[clamp(1.05rem,0.6vw+0.9rem,1.25rem)] text-primary" />
              <span>Metryki wydajności</span>
            </div>
          </div>
        </div>

        {/* Company Selector */}
        <div className="mx-auto max-w-5xl">
          <Suspense fallback={<CompanySelectorSkeleton />}>
            <CompanySelectorWrapper />
          </Suspense>
        </div>

        {/* Info Section */}
        <div className="mx-auto flex max-w-4xl flex-col fluid-stack-lg">
          <h2 className="text-center font-bold text-foreground fluid-h2">Co możesz analizować?</h2>

          <div className="grid gap-[clamp(1rem,1.6vw,1.4rem)] sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-card/72 p-[clamp(1.1rem,1.5vw,1.3rem)] shadow-xs transition-all hover:shadow-md backdrop-blur-[36px]!">
              <div className="flex h-[clamp(2.8rem,3.2vw,3.1rem)] w-[clamp(2.8rem,3.2vw,3.1rem)] items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-[clamp(1.3rem,0.7vw+1.1rem,1.5rem)] w-[clamp(1.3rem,0.7vw+1.1rem,1.5rem)] text-primary" />
              </div>
              <h3 className="font-semibold text-foreground fluid-copy">Ceny i Historia</h3>
              <p className="text-muted-foreground fluid-caption">
                Porównaj ceny planów, śledź zmiany historyczne i znajdź najlepsze oferty.
              </p>
            </div>

            <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-card/72 p-[clamp(1.1rem,1.5vw,1.3rem)] shadow-xs transition-all hover:shadow-md backdrop-blur-[36px]!">
              <div className="flex h-[clamp(2.8rem,3.2vw,3.1rem)] w-[clamp(2.8rem,3.2vw,3.1rem)] items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-[clamp(1.3rem,0.7vw+1.1rem,1.5rem)] w-[clamp(1.3rem,0.7vw+1.1rem,1.5rem)] text-primary" />
              </div>
              <h3 className="font-semibold text-foreground fluid-copy">Warunki Handlowe</h3>
              <p className="text-muted-foreground fluid-caption">
                Analizuj maksymalne obciążenie, cele zysku, dźwignię i inne parametry.
              </p>
            </div>

            <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-card/72 p-[clamp(1.1rem,1.5vw,1.3rem)] shadow-xs transition-all hover:shadow-md backdrop-blur-[36px]!">
              <div className="flex h-[clamp(2.8rem,3.2vw,3.1rem)] w-[clamp(2.8rem,3.2vw,3.1rem)] items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-[clamp(1.3rem,0.7vw+1.1rem,1.5rem)] w-[clamp(1.3rem,0.7vw+1.1rem,1.5rem)] text-primary" />
              </div>
              <h3 className="font-semibold text-foreground fluid-copy">Opinie i Oceny</h3>
              <p className="text-muted-foreground fluid-caption">
                Zobacz średnie oceny, rozkład opinii i rekomendacje użytkowników.
              </p>
            </div>

            <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-card/72 p-[clamp(1.1rem,1.5vw,1.3rem)] shadow-xs transition-all hover:shadow-md backdrop-blur-[36px]!">
              <div className="flex h-[clamp(2.8rem,3.2vw,3.1rem)] w-[clamp(2.8rem,3.2vw,3.1rem)] items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-[clamp(1.3rem,0.7vw+1.1rem,1.5rem)] w-[clamp(1.3rem,0.7vw+1.1rem,1.5rem)] text-primary" />
              </div>
              <h3 className="font-semibold text-foreground fluid-copy">Metryki Kluczowe</h3>
              <p className="text-muted-foreground fluid-caption">
                Porównaj cashback, liczbę planów, metody płatności i dostępne instrumenty.
              </p>
            </div>

            <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-card/72 p-[clamp(1.1rem,1.5vw,1.3rem)] shadow-xs transition-all hover:shadow-md backdrop-blur-[36px]!">
              <div className="flex h-[clamp(2.8rem,3.2vw,3.1rem)] w-[clamp(2.8rem,3.2vw,3.1rem)] items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-[clamp(1.3rem,0.7vw+1.1rem,1.5rem)] w-[clamp(1.3rem,0.7vw+1.1rem,1.5rem)] text-primary" />
              </div>
              <h3 className="font-semibold text-foreground fluid-copy">Wypłaty</h3>
              <p className="text-muted-foreground fluid-caption">
                Analizuj częstotliwość wypłat, czas oczekiwania i podział zysków.
              </p>
            </div>

            <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-card/72 p-[clamp(1.1rem,1.5vw,1.3rem)] shadow-xs transition-all hover:shadow-md backdrop-blur-[36px]!">
              <div className="flex h-[clamp(2.8rem,3.2vw,3.1rem)] w-[clamp(2.8rem,3.2vw,3.1rem)] items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-[clamp(1.3rem,0.7vw+1.1rem,1.5rem)] w-[clamp(1.3rem,0.7vw+1.1rem,1.5rem)] text-primary" />
              </div>
              <h3 className="font-semibold text-foreground fluid-copy">Profile Firm</h3>
              <p className="text-muted-foreground fluid-caption">
                Sprawdź regulacje, licencje, zespoły i certyfikaty bezpieczeństwa.
              </p>
            </div>
          </div>
        </div>
    </Section>
  </div>
);
}

