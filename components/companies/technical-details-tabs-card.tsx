"use client";

import { Gauge, Layers, Receipt, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccordionItemClient, InstrumentGroupCard, CommissionCard, RulesCard } from "@/components/companies/accordion-item-client";
import { LeverageTiersCard } from "@/components/companies/leverage-tiers-card";
import { CommissionsSection } from "@/components/companies/commissions-section";
import { RulesSection } from "@/components/companies/rules-section";
import type { Company } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TechnicalDetailsTabsCardProps {
  company: Company;
}

export function TechnicalDetailsTabsCard({ company }: TechnicalDetailsTabsCardProps) {
  const hasInstruments = company.instrumentGroups.length > 0;
  const hasLeverage = company.leverageTiers.length > 0;
  const hasCommissions = company.tradingCommissions.length > 0;
  const hasRules = company.firmRules.allowed.length > 0 || company.firmRules.restricted.length > 0;

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
    <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md">
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
                  "border-transparent bg-muted/30 text-muted-foreground hover:border-primary/50 hover:shadow-xs",
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
                  "border-transparent bg-muted/30 text-muted-foreground hover:border-primary/50 hover:shadow-xs",
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
                  "border-transparent bg-muted/30 text-muted-foreground hover:border-primary/50 hover:shadow-xs",
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
                  "border-transparent bg-muted/30 text-muted-foreground hover:border-primary/50 hover:shadow-xs",
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
                {company.instrumentGroups.map((group) => (
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
              <LeverageTiersCard tiers={company.leverageTiers} />
            </TabsContent>
          )}

          {hasCommissions && (
            <TabsContent value="commissions" className="mt-0">
              <CommissionsSection commissions={company.tradingCommissions} />
            </TabsContent>
          )}

          {hasRules && (
            <TabsContent value="rules" className="mt-0">
              <RulesSection allowed={company.firmRules.allowed} restricted={company.firmRules.restricted} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

