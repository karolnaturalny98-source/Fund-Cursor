import { Calendar, Clock } from "lucide-react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { PayoutsQuickStats } from "@/components/companies/payouts-quick-stats";
import { PayoutsTable } from "@/components/companies/payouts-table";
import { PayoutsChartsWrapper } from "@/components/companies/payouts-charts-wrapper";
import { PayoutsTimeline } from "@/components/companies/payouts-timeline";
import { PayoutsComparison } from "@/components/companies/payouts-comparison";
import { PayoutCalendar } from "@/components/companies/payout-calendar";
import type { CompanyWithDetails } from "@/lib/types";
import type { CompanyPayoutSummary } from "@/components/companies/company-profile-types";

interface CompanyPayoutsSectionProps {
  company: CompanyWithDetails;
}

export function CompanyPayoutsSection({ company }: CompanyPayoutsSectionProps) {
  const summary = buildPayoutSummary(company);

  const fastestPayout = summary.rows.reduce((fastest, row) => {
    const daysMatch = row.firstPayout.match(/(\d+)/);
    const currentDays = daysMatch ? Number.parseInt(daysMatch[1], 10) : Infinity;
    const fastestDays = fastest?.firstPayout.match(/(\d+)/)
      ? Number.parseInt(fastest.firstPayout.match(/(\d+)/)![1], 10)
      : Infinity;
    return currentDays < fastestDays ? row : fastest;
  }, summary.rows[0]);

  const tableRows = summary.rows.map((row) => ({
    ...row,
    isFastest: fastestPayout && row.id === fastestPayout.id,
  }));

  return (
    <TooltipProvider>
      <div className="flex flex-col fluid-stack-lg">
        <PayoutsQuickStats company={company} />

        <section className="flex flex-col fluid-stack-md">
          <div className="flex flex-col fluid-stack-xs">
            <h2 className="fluid-copy font-semibold">Harmonogram wypłat</h2>
            <p className="fluid-caption text-muted-foreground">
              Szczegółowe informacje o terminach wypłat dla każdego planu.
            </p>
          </div>
          <Card className="border border-border/40">
            <CardContent className="p-4">
              <PayoutsTable rows={tableRows} />
            </CardContent>
          </Card>
        </section>

        <PayoutsChartsWrapper company={company} />
        <PayoutsTimeline company={company} />
        <PayoutsComparison company={company} />

        <section className="flex flex-col fluid-stack-md">
          <div className="flex flex-col fluid-stack-xs">
            <div className="flex items-center gap-[clamp(0.4rem,0.6vw,0.5rem)]">
              <Calendar className="h-[clamp(0.9rem,0.5vw+0.8rem,1rem)] w-[clamp(0.9rem,0.5vw+0.8rem,1rem)] text-primary" />
              <h3 className="fluid-copy font-semibold">Kalendarz wypłat</h3>
            </div>
            <p className="fluid-caption text-muted-foreground">
              Sprawdź dostępne terminy wypłat i zaplanuj swoje transakcje.
            </p>
          </div>
          <Card className="border border-border/40">
            <CardContent className="p-4">
              <PayoutCalendar company={company} />
            </CardContent>
          </Card>
        </section>

        {summary.slaNotice ? (
          <Card className="border-primary/30 bg-primary/10">
            <CardContent className="flex items-start gap-3 p-4">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="flex flex-col fluid-stack-xs">
                <CardTitle className="fluid-caption font-semibold text-primary">Ważna informacja</CardTitle>
                <CardDescription className="fluid-caption text-primary/90">{summary.slaNotice}</CardDescription>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </TooltipProvider>
  );
}

function buildPayoutSummary(company: CompanyWithDetails): CompanyPayoutSummary {
  const rows = company.plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    evaluationModel: plan.evaluationModel,
    firstPayout: formatDays(plan.payoutFirstAfterDays),
    cycle: plan.payoutCycleDays ? `co ${plan.payoutCycleDays} dni` : "Brak danych",
    profitSplit: plan.profitSplit,
    notes: plan.notes,
  }));

  const slowestCycle = company.plans
    .map((plan) => plan.payoutCycleDays ?? null)
    .filter((value): value is number => value !== null)
    .sort((a, b) => b - a)[0];

  return {
    highlights: [],
    rows,
    slaNotice: slowestCycle
      ? `Najdłuższy cykl wypłat wynosi ${slowestCycle} dni – upewnij się, że mieści się w Twoim planie cashflow.`
      : null,
  };
}

function formatDays(days: number | null | undefined) {
  if (!days || days <= 0) {
    return "Brak danych";
  }
  if (days === 1) {
    return "po 1 dniu";
  }
  return `po ${days} dniach`;
}
