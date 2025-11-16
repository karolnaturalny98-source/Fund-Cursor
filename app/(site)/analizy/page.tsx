import { Metadata } from "next";
import { Suspense } from "react";
import { BarChart3, TrendingUp, FileText, Award } from "lucide-react";

import { getCompanyOptions } from "@/lib/queries/companies";
import { CompanySelector } from "@/components/analysis/company-selector";
import { CompanySelectorSkeleton } from "@/components/analysis/loading-skeleton";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export const metadata: Metadata = {
  title: "Analizy Firm | FundedRank",
  description:
    "Zaawansowane narzędzie do porównywania firm prop tradingowych. Analizuj ceny, plany, opinie i wiele więcej.",
};

const ANALYSIS_FEATURES = [
  {
    icon: TrendingUp,
    title: "Ceny i Historia",
    description:
      "Porównaj ceny planów, śledź zmiany historyczne i znajdź najlepsze oferty.",
  },
  {
    icon: FileText,
    title: "Warunki Handlowe",
    description: "Analizuj maksymalne obciążenie, cele zysku, dźwignię i inne parametry.",
  },
  {
    icon: Award,
    title: "Opinie i Oceny",
    description: "Zobacz średnie oceny, rozkład opinii i rekomendacje użytkowników.",
  },
  {
    icon: BarChart3,
    title: "Metryki Kluczowe",
    description: "Porównaj cashback, liczbę planów, metody płatności i dostępne instrumenty.",
  },
  {
    icon: TrendingUp,
    title: "Wypłaty",
    description: "Analizuj częstotliwość wypłat, czas oczekiwania i podział zysków.",
  },
  {
    icon: Award,
    title: "Profile Firm",
    description: "Sprawdź regulacje, licencje, zespoły i certyfikaty bezpieczeństwa.",
  },
];

async function CompanySelectorWrapper() {
  const companies = await getCompanyOptions();
  return <CompanySelector companies={companies} />;
}

export default async function AnalizyPage() {
  return (
    <Section size="lg" stack="xl" className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="flex flex-col gap-6 text-center">
          <Badge
            variant="pill"
            className="mx-auto w-fit gap-2 border-border/60 bg-card/72 text-primary shadow-xs backdrop-blur-xl"
          >
            <BarChart3 className="fluid-icon-md" />
            Narzędzie Analityczne
          </Badge>

          <Heading level={1} variant="hero">
            Zaawansowana Analiza Firm
          </Heading>

          <Text variant="body" tone="muted" align="center" className="mx-auto max-w-2xl">
            Porównaj do 3 firm prop tradingowych jednocześnie. Analizuj ceny planów,
            warunki handlowe, opinie użytkowników i metryki wydajności w jednym miejscu.
          </Text>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge
              variant="pill"
              className="gap-2 border-border/60 bg-card/72 text-primary shadow-xs transition-all hover:bg-card/80 backdrop-blur-xl"
            >
              <TrendingUp className="fluid-icon-md text-primary" />
              <span>Wykresy cenowe</span>
            </Badge>
            <Badge
              variant="pill"
              className="gap-2 border-border/60 bg-card/72 text-primary shadow-xs transition-all hover:bg-card/80 backdrop-blur-xl"
            >
              <FileText className="fluid-icon-md text-primary" />
              <span>Porównanie planów</span>
            </Badge>
            <Badge
              variant="pill"
              className="gap-2 border-border/60 bg-card/72 text-primary shadow-xs transition-all hover:bg-card/80 backdrop-blur-xl"
            >
              <Award className="fluid-icon-md text-primary" />
              <span>Analiza opinii</span>
            </Badge>
            <Badge
              variant="pill"
              className="gap-2 border-border/60 bg-card/72 text-primary shadow-xs transition-all hover:bg-card/80 backdrop-blur-xl"
            >
              <BarChart3 className="fluid-icon-md text-primary" />
              <span>Metryki wydajności</span>
            </Badge>
          </div>
        </div>

        {/* Company Selector */}
        <div className="mx-auto max-w-5xl">
          <Suspense fallback={<CompanySelectorSkeleton />}>
            <CompanySelectorWrapper />
          </Suspense>
        </div>

        {/* Info Section */}
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          <Heading level={2} variant="section" align="center">
            Co możesz analizować?
          </Heading>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ANALYSIS_FEATURES.map(({ icon: Icon, title, description }) => (
              <Surface
                key={title}
                variant="panel"
                padding="lg"
                className="flex flex-col gap-4 transition-all hover:border-primary/40"
              >
                <div className="flex items-center justify-center fluid-icon-card bg-primary/10">
                  <Icon className="fluid-icon-md text-primary" />
                </div>
                <Heading level={3} variant="subsection" className="text-foreground">
                  {title}
                </Heading>
                <Text variant="caption" tone="muted">
                  {description}
                </Text>
              </Surface>
            ))}
          </div>
        </div>
      </Section>
  );
}
