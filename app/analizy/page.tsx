import { Metadata } from "next";
import { Suspense } from "react";
import { BarChart3, TrendingUp, FileText, Award } from "lucide-react";

import { getCompanyOptions } from "@/lib/queries/companies";
import { CompanySelector } from "@/components/analysis/company-selector";
import { CompanySelectorSkeleton } from "@/components/analysis/loading-skeleton";
import { AuroraWrapper } from "@/components/aurora-wrapper";

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
          colorStops={["#1e5a3d", "#34d399", "#a7f3d0"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      <div className="container py-12 animate-in fade-in duration-500">
        {/* Hero Section */}
        <div className="mb-12 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/72 backdrop-blur-[36px]! px-4 py-2 text-sm font-medium text-primary">
            <BarChart3 className="h-4 w-4" />
            Narzędzie Analityczne
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Zaawansowana Analiza Firm
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground">
            Porównaj do 3 firm prop tradingowych jednocześnie. Analizuj ceny planów,
            warunki handlowe, opinie użytkowników i metryki wydajności w jednym miejscu.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/72 backdrop-blur-[36px]! px-4 py-2 text-sm transition-all hover:bg-card/82">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Wykresy cenowe</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/72 backdrop-blur-[36px]! px-4 py-2 text-sm transition-all hover:bg-card/82">
              <FileText className="h-4 w-4 text-primary" />
              <span>Porównanie planów</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/72 backdrop-blur-[36px]! px-4 py-2 text-sm transition-all hover:bg-card/82">
              <Award className="h-4 w-4 text-primary" />
              <span>Analiza opinii</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/72 backdrop-blur-[36px]! px-4 py-2 text-sm transition-all hover:bg-card/82">
              <BarChart3 className="h-4 w-4 text-primary" />
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
        <div className="mx-auto mt-16 max-w-4xl space-y-8">
          <h2 className="text-center text-2xl font-bold">Co możesz analizować?</h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3 rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-6 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Ceny i Historia</h3>
              <p className="text-sm text-muted-foreground">
                Porównaj ceny planów, śledź zmiany historyczne i znajdź najlepsze oferty.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-6 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Warunki Handlowe</h3>
              <p className="text-sm text-muted-foreground">
                Analizuj maksymalne obciążenie, cele zysku, dźwignię i inne parametry.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-6 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Opinie i Oceny</h3>
              <p className="text-sm text-muted-foreground">
                Zobacz średnie oceny, rozkład opinii i rekomendacje użytkowników.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-6 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Metryki Kluczowe</h3>
              <p className="text-sm text-muted-foreground">
                Porównaj cashback, liczbę planów, metody płatności i dostępne instrumenty.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-6 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Wypłaty</h3>
              <p className="text-sm text-muted-foreground">
                Analizuj częstotliwość wypłat, czas oczekiwania i podział zysków.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-6 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Profile Firm</h3>
              <p className="text-sm text-muted-foreground">
                Sprawdź regulacje, licencje, zespoły i certyfikaty bezpieczeństwa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

