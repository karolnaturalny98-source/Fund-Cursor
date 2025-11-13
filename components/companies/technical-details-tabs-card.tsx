"use client";

import { Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstrumentGroupCard } from "@/components/companies/accordion-item-client";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/analysis/loading-skeleton";
import type { CompanyCommission, CompanyInstrumentGroup, CompanyLeverageTier, CompanyRules } from "@/lib/types";

const LeverageTiersCard = dynamic(
  () => import("@/components/companies/leverage-tiers-card").then((mod) => ({ default: mod.LeverageTiersCard })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const CommissionsSection = dynamic(
  () => import("@/components/companies/commissions-section").then((mod) => ({ default: mod.CommissionsSection })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const RulesSection = dynamic(
  () => import("@/components/companies/rules-section").then((mod) => ({ default: mod.RulesSection })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
import type { Company } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TechnicalDetailsTabsCardProps {
  company: Company;
}

export function TechnicalDetailsTabsCard({ company }: TechnicalDetailsTabsCardProps) {
  const instrumentGroups = normalizeInstrumentGroups(company.instrumentGroups, company.instruments);
  const leverageTiers = normalizeLeverageTiers(company.leverageTiers, company.plans ?? []);
  const tradingCommissions = normalizeCommissions(company.tradingCommissions);
  const firmRules = normalizeFirmRules(company.firmRules);

  const hasInstruments = instrumentGroups.length > 0;
  const hasLeverage = leverageTiers.length > 0;
  const hasCommissions = tradingCommissions.length > 0;
  const hasRules = firmRules.allowed.length > 0 || firmRules.restricted.length > 0;

  if (!hasInstruments && !hasLeverage && !hasCommissions && !hasRules) {
    return null;
  }

  // Determine default tab
  const defaultTab = hasInstruments
    ? "instruments"
    : hasLeverage
      ? "leverage"
      : hasCommissions
        ? "commissions"
        : hasRules
          ? "rules"
          : "instruments";

  return (
    <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-semibold sm:text-2xl">
            Szczegóły techniczne
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Szczegółowe informacje techniczne dotyczące instrumentów, dźwigni, prowizji i zasad firmy.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList className="flex w-full gap-2 bg-transparent p-0">
            {hasInstruments && (
              <TabsTrigger
                value="instruments"
                className={cn(
                  "flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-primary/50 data-[state=inactive]:hover:shadow-xs",
                  "data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs",
                )}
              >
                Instrumenty i aktywa
              </TabsTrigger>
            )}
            {hasLeverage && (
              <TabsTrigger
                value="leverage"
                className={cn(
                  "flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-primary/50 data-[state=inactive]:hover:shadow-xs",
                  "data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs",
                )}
              >
                Profil dźwigni
              </TabsTrigger>
            )}
            {hasCommissions && (
              <TabsTrigger
                value="commissions"
                className={cn(
                  "flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-primary/50 data-[state=inactive]:hover:shadow-xs",
                  "data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs",
                )}
              >
                Prowizje
              </TabsTrigger>
            )}
            {hasRules && (
              <TabsTrigger
                value="rules"
                className={cn(
                  "flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-primary/50 data-[state=inactive]:hover:shadow-xs",
                  "data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs",
                )}
              >
                Zasady firmy
              </TabsTrigger>
            )}
          </TabsList>

          {hasInstruments && (
            <TabsContent value="instruments" className="mt-0">
              <div className="grid gap-4">
                {instrumentGroups.map((group) => (
                  <InstrumentGroupCard
                    key={group.title}
                    title={group.title}
                    description={group.description}
                    instruments={group.instruments}
                  />
                ))}
              </div>
            </TabsContent>
          )}

          {hasLeverage && (
            <TabsContent value="leverage" className="mt-0">
              <LeverageTiersCard tiers={leverageTiers} />
            </TabsContent>
          )}

          {hasCommissions && (
            <TabsContent value="commissions" className="mt-0">
              <CommissionsSection commissions={tradingCommissions} />
            </TabsContent>
          )}

          {hasRules && (
            <TabsContent value="rules" className="mt-0">
              <RulesSection allowed={firmRules.allowed} restricted={firmRules.restricted} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function normalizeInstrumentGroups(
  groups: CompanyInstrumentGroup[],
  flatInstruments: string[],
): CompanyInstrumentGroup[] {
  const sanitizedGroups = groups
    .map((group) => ({
      title: group.title,
      description: group.description,
      instruments: (group.instruments ?? []).map((item) => item.trim()).filter(Boolean),
    }))
    .filter((group) => group.instruments.length > 0);

  if (sanitizedGroups.length > 0) {
    return sanitizedGroups;
  }

  const fallbackInstruments = flatInstruments.map((item) => item.trim()).filter(Boolean);

  if (fallbackInstruments.length === 0) {
    return [];
  }

  return [
    {
      title: "Instrumenty dostępne",
      description: "Lista wygenerowana na podstawie danych ogólnych firmy.",
      instruments: fallbackInstruments,
    },
  ];
}

function normalizeLeverageTiers(
  tiers: CompanyLeverageTier[],
  plans: Company["plans"],
): CompanyLeverageTier[] {
  const sanitizedTiers = tiers.map((tier) => ({
    label: tier.label,
    accountSize: tier.accountSize ?? null,
    maxLeverage: typeof tier.maxLeverage === "number" ? tier.maxLeverage : null,
    notes: tier.notes ?? null,
  }));

  if (sanitizedTiers.length > 0) {
    return sanitizedTiers;
  }

  const fallback = (plans ?? [])
    .filter((plan) => typeof plan.leverage === "number" && plan.leverage !== null)
    .map((plan) => ({
      label: plan.name,
      accountSize: resolveAccountSize(plan),
      maxLeverage: Number(plan.leverage),
      notes: plan.notes ?? plan.description ?? null,
    }));

  return fallback;
}

function resolveAccountSize(plan: NonNullable<Company["plans"]>[number]): string | null {
  if (plan.accountType && plan.accountType.trim().length > 0) {
    return plan.accountType.trim();
  }

  if (typeof plan.price === "number" && plan.currency) {
    try {
      return new Intl.NumberFormat("pl-PL", {
        style: "currency",
        currency: plan.currency.toUpperCase(),
        maximumFractionDigits: 0,
      }).format(plan.price);
    } catch {
      return `${plan.price.toLocaleString("pl-PL")} ${plan.currency.toUpperCase()}`;
    }
  }

  return null;
}

function normalizeCommissions(commissions: CompanyCommission[]): CompanyCommission[] {
  return commissions
    .map((commission) => ({
      market: commission.market.trim(),
      value: commission.value.trim(),
      notes: commission.notes?.trim() ?? null,
    }))
    .filter((commission) => commission.market.length > 0 && commission.value.length > 0);
}

function normalizeFirmRules(rules: CompanyRules): CompanyRules {
  const allowed = (rules.allowed ?? []).map((rule) => rule.trim()).filter(Boolean);
  const restricted = (rules.restricted ?? []).map((rule) => rule.trim()).filter(Boolean);

  return { allowed, restricted };
}

