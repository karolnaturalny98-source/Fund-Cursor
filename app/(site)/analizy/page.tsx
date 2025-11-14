import { Metadata } from "next";
import { Suspense } from "react";
import { BarChart3, TrendingUp, FileText, Award } from "lucide-react";

import { getCompanyOptions } from "@/lib/queries/companies";
import { CompanySelector } from "@/components/analysis/company-selector";
import { CompanySelectorSkeleton } from "@/components/analysis/loading-skeleton";
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
    <Section size="lg" className="flex flex-col fluid-stack-xl animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="flex flex-col fluid-stack-lg text-center">
          <div className="inline-flex fluid-pill border border-border/60 bg-card/72 text-primary shadow-xs backdrop-blur-xl">
            <BarChart3 className="fluid-icon-md" />
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
          <div className="flex flex-wrap items-center justify-center fluid-stack-xs">
            <div className="fluid-pill border border-border/60 bg-card/72 text-primary shadow-xs transition-all hover:bg-card/80 backdrop-blur-xl fluid-caption">
              <TrendingUp className="fluid-icon-md text-primary" />
              <span>Wykresy cenowe</span>
            </div>
            <div className="fluid-pill border border-border/60 bg-card/72 text-primary shadow-xs transition-all hover:bg-card/80 backdrop-blur-xl fluid-caption">
              <FileText className="fluid-icon-md text-primary" />
              <span>Porównanie planów</span>
            </div>
            <div className="fluid-pill border border-border/60 bg-card/72 text-primary shadow-xs transition-all hover:bg-card/80 backdrop-blur-xl fluid-caption">
              <Award className="fluid-icon-md text-primary" />
              <span>Analiza opinii</span>
            </div>
            <div className="fluid-pill border border-border/60 bg-card/72 text-primary shadow-xs transition-all hover:bg-card/80 backdrop-blur-xl fluid-caption">
              <BarChart3 className="fluid-icon-md text-primary" />
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

          <div className="grid fluid-stack-sm sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-card/72 fluid-card-pad-sm shadow-xs transition-all hover:shadow-md backdrop-blur-xl">
              <div className="flex items-center justify-center fluid-icon-card bg-primary/10">
                <TrendingUp className="fluid-icon-md text-primary" />
              </div>
              <h3 className="font-semibold text-foreground fluid-copy">Ceny i Historia</h3>
              <p className="text-muted-foreground fluid-caption">
                Porównaj ceny planów, śledź zmiany historyczne i znajdź najlepsze oferty.
              </p>
            </div>

            <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-card/72 fluid-card-pad-sm shadow-xs transition-all hover:shadow-md backdrop-blur-xl">
              <div className="flex items-center justify-center fluid-icon-card bg-primary/10">
                <FileText className="fluid-icon-md text-primary" />
              </div>
              <h3 className="font-semibold text-foreground fluid-copy">Warunki Handlowe</h3>
              <p className="text-muted-foreground fluid-caption">
                Analizuj maksymalne obciążenie, cele zysku, dźwignię i inne parametry.
              </p>
            </div>

            <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-card/72 fluid-card-pad-sm shadow-xs transition-all hover:shadow-md backdrop-blur-xl">
              <div className="flex items-center justify-center fluid-icon-card bg-primary/10">
                <Award className="fluid-icon-md text-primary" />
              </div>
              <h3 className="font-semibold text-foreground fluid-copy">Opinie i Oceny</h3>
              <p className="text-muted-foreground fluid-caption">
                Zobacz średnie oceny, rozkład opinii i rekomendacje użytkowników.
              </p>
            </div>

            <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-card/72 fluid-card-pad-sm shadow-xs transition-all hover:shadow-md backdrop-blur-xl">
              <div className="flex items-center justify-center fluid-icon-card bg-primary/10">
                <BarChart3 className="fluid-icon-md text-primary" />
              </div>
              <h3 className="font-semibold text-foreground fluid-copy">Metryki Kluczowe</h3>
              <p className="text-muted-foreground fluid-caption">
                Porównaj cashback, liczbę planów, metody płatności i dostępne instrumenty.
              </p>
            </div>

            <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-card/72 fluid-card-pad-sm shadow-xs transition-all hover:shadow-md backdrop-blur-xl">
              <div className="flex items-center justify-center fluid-icon-card bg-primary/10">
                <TrendingUp className="fluid-icon-md text-primary" />
              </div>
              <h3 className="font-semibold text-foreground fluid-copy">Wypłaty</h3>
              <p className="text-muted-foreground fluid-caption">
                Analizuj częstotliwość wypłat, czas oczekiwania i podział zysków.
              </p>
            </div>

            <div className="flex flex-col fluid-stack-sm rounded-2xl border border-border/60 bg-card/72 fluid-card-pad-sm shadow-xs transition-all hover:shadow-md backdrop-blur-xl">
              <div className="flex items-center justify-center fluid-icon-card bg-primary/10">
                <Award className="fluid-icon-md text-primary" />
              </div>
              <h3 className="font-semibold text-foreground fluid-copy">Profile Firm</h3>
              <p className="text-muted-foreground fluid-caption">
                Sprawdź regulacje, licencje, zespoły i certyfikaty bezpieczeństwa.
              </p>
            </div>
          </div>
        </div>
      </Section>
  );
}
