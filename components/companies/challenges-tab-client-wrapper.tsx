"use client";

import { useState } from "react";
import { ChallengeSegmentsAccordion } from "@/components/companies/challenges-tab-client";
import { ChallengesComparisonChart } from "@/components/companies/challenges-comparison-chart";
import { PlansExplorer } from "@/components/companies/plans-explorer";
import { ChallengeHighlightCard } from "@/components/companies/challenges-tab-client";
import { PayoutCalculator } from "@/components/companies/payout-calculator";
import { Zap, TrendingUp, Layers } from "lucide-react";

type CompanyWithDetails = NonNullable<Awaited<ReturnType<typeof import("@/lib/queries/companies").getCompanyBySlug>>>;

interface ChallengesTabClientWrapperProps {
  company: CompanyWithDetails;
  bestProfitSplit: string | null;
  bestLeverage: number | null;
  highlights: Array<{
    id: string;
    label: string;
    value: string;
    description?: string;
    iconName: string;
  }>;
}

export function ChallengesTabClientWrapper({
  company,
  bestProfitSplit: _bestProfitSplit,
  bestLeverage: _bestLeverage,
  highlights,
}: ChallengesTabClientWrapperProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const instantPlans = company.plans.filter((plan) => plan.evaluationModel === "instant-funding");
  const oneStepPlans = company.plans.filter((plan) => plan.evaluationModel === "one-step");
  const twoStepPlans = company.plans.filter((plan) => plan.evaluationModel === "two-step");

  const planGroups = [
    {
      id: "instant",
      label: "Instant funding",
      description: "Bez wyzwania – natychmiastowy dostęp do kapitału w zamian za wyższą opłatę.",
      plans: instantPlans,
      icon: Zap,
      color: "emerald",
    },
    {
      id: "one-step",
      label: "1-etapowe wyzwanie",
      description: "Szybsza ścieżka weryfikacji z umiarkowanymi wymaganiami i krótkim czasem oczekiwania.",
      plans: oneStepPlans,
      icon: TrendingUp,
      color: "blue",
    },
    {
      id: "two-step",
      label: "2-etapowe wyzwanie",
      description: "Klasyczny model challenge – niższe koszty startu i większa tolerancja błędów.",
      plans: twoStepPlans,
      icon: Layers,
      color: "purple",
    },
  ];

  const hasSegments = planGroups.some((group) => group.plans.length > 0);

  const handleSegmentClick = (segmentId: string) => {
    const newValue = segmentId === "" ? null : (selectedSegment === segmentId ? null : segmentId);
    setSelectedSegment(newValue);
    // Scroll do sekcji planów jeśli segment został wybrany
    if (newValue) {
      setTimeout(() => {
        const plansSection = document.getElementById("plany");
        if (plansSection) {
          plansSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  const handleModelFilterChange = (model: string | null) => {
    setSelectedSegment(model);
  };

  return (
    <div className="space-y-12">
      {hasSegments ? (
        <section className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold sm:text-2xl">Segmenty wyzwań</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Porównaj ścieżki finansowania – rozwiń interesujący segment, aby zobaczyć plany i przefiltrować listę.
            </p>
          </div>
          <ChallengeSegmentsAccordion
            groups={planGroups.map((group) => ({
              id: group.id,
              label: group.label,
              description: group.description,
              plans: group.plans.map((p) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                currency: p.currency,
              })),
              iconName: group.icon === Zap ? "Zap" : group.icon === TrendingUp ? "TrendingUp" : "Layers",
              color: group.color as "emerald" | "blue" | "purple",
            }))}
            selectedSegment={selectedSegment}
            onSegmentClick={handleSegmentClick}
          />
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Szczegółowe plany</h3>
          <p className="text-sm text-muted-foreground">
            Użyj filtrów, aby dopasować model wyzwania do swojego stylu handlu i budżetu.
          </p>
        </div>
        <PlansExplorer
          plans={company.plans}
          companySlug={company.slug}
          cashbackRate={company.cashbackRate}
          initialModelFilter={selectedSegment}
          onModelFilterChange={handleModelFilterChange}
        />
        <ChallengesComparisonChart plans={company.plans} />
      </section>

      <section className="space-y-3">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold sm:text-xl">Podsumowanie programów</h2>
          <p className="text-xs text-muted-foreground">
            Kluczowe parametry na start – rozważ dźwignię, wypłaty oraz zasady przed wyborem planu.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {highlights.map((item) => (
            <ChallengeHighlightCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Kalkulator wypłaty</h3>
          <p className="text-sm text-muted-foreground">
            Oszacuj potencjalne wypłaty przy aktualnych stawkach cashbacku FundedRank i porównaj harmonogramy.
          </p>
        </div>
        <PayoutCalculator plans={company.plans} cashbackRate={company.cashbackRate} />
      </section>
    </div>
  );
}

