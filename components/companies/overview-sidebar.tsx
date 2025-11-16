"use client";

import Link from "next/link";
import { Layers, MessageSquare, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Surface } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { CompanyPopularityChart } from "@/components/companies/company-popularity-chart";
import { DefaultPlanCardClient } from "@/components/companies/company-page-client";
import {
  Accordion,
} from "@/components/ui/accordion";
import { AccordionItemClient, InstrumentGroupCard, CommissionCard, RulesCard } from "@/components/companies/accordion-item-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Company, CompanyPlan, CompanyRankingHistory } from "@/lib/types";

interface OverviewSidebarProps {
  company: Company;
  rankingHistory: CompanyRankingHistory[];
  defaultPlan: CompanyPlan | null;
}

export function OverviewSidebar({
  company,
  rankingHistory,
  defaultPlan,
}: OverviewSidebarProps) {
  const hasTechnicalDetails =
    company.instrumentGroups.length > 0 ||
    company.leverageTiers.length > 0 ||
    company.tradingCommissions.length > 0 ||
    company.firmRules.allowed.length > 0 ||
    company.firmRules.restricted.length > 0;

  // Determine default accordion item
  const defaultAccordionValue =
    company.instrumentGroups.length > 0
      ? "instruments"
      : company.leverageTiers.length > 0
        ? "leverage"
        : company.tradingCommissions.length > 0
          ? "commissions"
          : company.firmRules.allowed.length || company.firmRules.restricted.length
            ? "rules"
            : undefined;

  return (
    <div className="sticky top-8 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
      {rankingHistory.length > 0 && (
        <CompanyPopularityChart
          rankingHistory={rankingHistory}
          companyName={company.name}
        />
      )}

      {hasTechnicalDetails && (
        <Card variant="gradient" className="rounded-2xl backdrop-blur-[36px]!">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Szczegóły techniczne</CardTitle>
            <p className="text-xs text-muted-foreground">
              Kliknij aby rozwinąć sekcję i zobaczyć szczegóły.
            </p>
          </CardHeader>
          <CardContent>
            <Accordion
              type="single"
              collapsible
              defaultValue={defaultAccordionValue}
              className="space-y-3"
            >
              {company.instrumentGroups.length > 0 ? (
                <AccordionItemClient
                  value="instruments"
                  iconName="Layers"
                  label="Instrumenty i aktywa"
                  count={company.instrumentGroups.length}
                >
                  <div className="grid gap-4 pt-2">
                    {company.instrumentGroups.map((group) => (
                      <InstrumentGroupCard
                        key={group.title}
                        title={group.title}
                        description={group.description}
                        instruments={group.instruments}
                      />
                    ))}
                  </div>
                </AccordionItemClient>
              ) : null}

              {company.leverageTiers.length > 0 ? (
                <AccordionItemClient
                  value="leverage"
                  iconName="Gauge"
                  label="Profil dźwigni"
                  count={company.leverageTiers.length}
                >
                  <Surface variant="gradient" padding="xs" className="overflow-x-auto rounded-xl pt-2">
                    <Table>

                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-3 py-2 text-left text-xs">Segment</TableHead>
                          <TableHead className="px-3 py-2 text-left text-xs">Konto</TableHead>
                          <TableHead className="px-3 py-2 text-left text-xs">Max dźwignia</TableHead>
                          <TableHead className="px-3 py-2 text-left text-xs">Notatki</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {company.leverageTiers.map((tier) => (
                          <TableRow key={`${tier.label}-${tier.accountSize ?? "default"}`}>
                            <TableCell className="px-3 py-2 text-sm font-semibold text-foreground">
                              {tier.label}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                              {tier.accountSize ?? "?"}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                              {typeof tier.maxLeverage === "number" ? `1:${tier.maxLeverage}` : "?"}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                              {tier.notes ?? "?"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Surface>
                </AccordionItemClient>
              ) : null}

              {company.tradingCommissions.length > 0 ? (
                <AccordionItemClient
                  value="commissions"
                  iconName="Receipt"
                  label="Prowizje"
                  count={company.tradingCommissions.length}
                >
                  <div className="grid gap-3 pt-2">
                    {company.tradingCommissions.map((commission) => (
                      <CommissionCard
                        key={`${commission.market}-${commission.value}`}
                        market={commission.market}
                        value={commission.value}
                        notes={commission.notes}
                      />
                    ))}
                  </div>
                </AccordionItemClient>
              ) : null}

              {company.firmRules.allowed.length > 0 || company.firmRules.restricted.length > 0 ? (
                <AccordionItemClient
                  value="rules"
                  iconName="Shield"
                  label="Zasady firmy"
                  count={company.firmRules.allowed.length + company.firmRules.restricted.length}
                >
                  <div className="grid gap-3 pt-2">
                    <RulesCard type="allowed" rules={company.firmRules.allowed} />
                    <RulesCard type="restricted" rules={company.firmRules.restricted} />
                  </div>
                </AccordionItemClient>
              ) : null}
            </Accordion>
          </CardContent>
        </Card>
      )}

      <Card variant="gradient" className="rounded-2xl backdrop-blur-[36px]! transition-all hover:shadow-[0_35px_80px_-35px_rgba(15,23,42,0.55)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Szybkie linki</CardTitle>
          <p className="text-xs text-muted-foreground">
            Przejdź do innych sekcji profilu
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            asChild
            variant="premium-outline"
            className="w-full justify-start gap-2 rounded-full"
          >
            <Link href="#challenges">
              <PremiumIcon icon={Layers} variant="glow" size="sm" />
              Wyzwania
            </Link>
          </Button>
          <Button
            asChild
            variant="premium-outline"
            className="w-full justify-start gap-2 rounded-full"
          >
            <Link href="#reviews">
              <PremiumIcon icon={MessageSquare} variant="glow" size="sm" />
              Opinie
            </Link>
          </Button>
          <Button
            asChild
            variant="premium"
            className="w-full justify-start gap-2 rounded-full shadow-[0_22px_45px_-30px_rgba(15,23,42,0.5)]"
          >
            <Link href="#offers">
              <PremiumIcon icon={ShoppingCart} variant="glow" size="sm" />
              Oferty
            </Link>
          </Button>
        </CardContent>
      </Card>

      {defaultPlan ? (
        <DefaultPlanCardClient
          planName={defaultPlan.name}
          cashbackRate={company.cashbackRate}
        />
      ) : null}
    </div>
  );
}
