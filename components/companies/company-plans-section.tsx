import { ChallengesTabClientWrapper } from "@/components/companies/challenges-tab-client-wrapper";
import type { CompanyWithDetails } from "@/lib/types";
import type { CompanyPlanHighlight } from "@/components/companies/company-profile-types";

interface CompanyPlansSectionProps {
  company: CompanyWithDetails;
  bestProfitSplit: string | null;
  bestLeverage: number | null;
}

export function CompanyPlansSection({ company, bestProfitSplit, bestLeverage }: CompanyPlansSectionProps) {
  const highlights = buildChallengeHighlights(company, bestProfitSplit, bestLeverage);

  return (
    <ChallengesTabClientWrapper
      company={company}
      bestProfitSplit={bestProfitSplit}
      bestLeverage={bestLeverage}
      highlights={highlights}
    />
  );
}

function buildChallengeHighlights(
  company: CompanyWithDetails,
  bestProfitSplit: string | null,
  bestLeverage: number | null,
): CompanyPlanHighlight[] {
  const lowestPricePlan = [...company.plans].sort((a, b) => a.price - b.price)[0] ?? null;
  const fastestPayoutPlan = [...company.plans]
    .filter((plan) => (plan.payoutFirstAfterDays ?? Infinity) !== Infinity)
    .sort((a, b) => (a.payoutFirstAfterDays ?? Infinity) - (b.payoutFirstAfterDays ?? Infinity))[0] ?? null;

  return [
    {
      id: "cashback",
      label: "Cashback",
      value: company.cashbackRate ? `${company.cashbackRate} pkt` : "brak programu",
      description: "Punkty FundedRank naliczane przy zakupie kwalifikowanych planów.",
      iconName: "Award",
    },
    {
      id: "profit-split",
      label: "Najlepszy profit split",
      value: bestProfitSplit ?? "n/d",
      description: "Najwyższy udział w zyskach dostępny w planach challenge.",
      iconName: "TrendingUp",
    },
    {
      id: "leverage",
      label: "Maksymalna dźwignia",
      value: typeof bestLeverage === "number" ? `1:${bestLeverage}` : "n/d",
      description: "Deklarowany limit dźwigni na najwyższym segmencie konta.",
      iconName: "Gauge",
    },
    {
      id: "entry-price",
      label: "Najniższy koszt wejścia",
      value: lowestPricePlan ? formatCurrency(lowestPricePlan.price, lowestPricePlan.currency) : "n/d",
      description: lowestPricePlan ? `Plan ${lowestPricePlan.name}` : "Brak planów w ofercie.",
      iconName: "Receipt",
    },
    {
      id: "payout",
      label: "Najszybszy pierwszy payout",
      value:
        typeof fastestPayoutPlan?.payoutFirstAfterDays === "number"
          ? `${fastestPayoutPlan.payoutFirstAfterDays} dni`
          : "n/d",
      description: fastestPayoutPlan ? `Plan ${fastestPayoutPlan.name}` : "Brak informacji o harmonogramie wypłat.",
      iconName: "Clock",
    },
  ];
}

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString("pl-PL")} ${currency.toUpperCase()}`;
  }
}
