import { VerificationAccordionCard } from "@/components/companies/verification-accordion-card";
import { RulesGridClient } from "@/components/companies/company-page-client";
import type { CompanyWithDetails } from "@/lib/types";
import type { CompanyRiskAlert } from "@/components/companies/company-profile-types";

interface CompanyRulesSectionProps {
  company: CompanyWithDetails;
  alerts: CompanyRiskAlert[];
  bestProfitSplit: string | null;
  bestLeverage: number | null;
}

export function CompanyRulesSection({ company, alerts, bestProfitSplit, bestLeverage }: CompanyRulesSectionProps) {
  return (
    <section className="flex flex-col fluid-stack-lg">
      <VerificationAccordionCard company={company} alerts={alerts} />
      <RulesGridClient
        rows={[
          {
            iconName: "Shield",
            label: "Regulacja",
            value: company.regulation ?? "Brak informacji",
          },
          {
            iconName: "LifeBuoy",
            label: "Wsparcie",
            value: company.supportContact ?? "Brak danych",
          },
          {
            iconName: "TrendingUp",
            label: "Najlepszy profit split",
            value: bestProfitSplit ?? "Brak danych",
          },
          {
            iconName: "BookOpen",
            label: "Materiały edukacyjne",
            value: company.educationLinks.length ? `${company.educationLinks.length} linków` : "Brak",
          },
          {
            iconName: "Receipt",
            label: "Płatności",
            value: company.paymentMethods.length ? company.paymentMethods.join(", ") : "Brak danych",
          },
          {
            iconName: "Gauge",
            label: "Dźwignia",
            value: typeof bestLeverage === "number" ? `${bestLeverage}x` : "Brak danych",
          },
        ]}
      />
    </section>
  );
}
