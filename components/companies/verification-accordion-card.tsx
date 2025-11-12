"use client";

import { ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LegalVerificationSection } from "@/components/companies/legal-verification-section";
import { CompanyCertifications } from "@/components/companies/company-certifications";
import { RiskAlertCard } from "@/components/companies/risk-alert-client";
import type { Company } from "@/lib/types";

interface RiskAlert {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  iconName: string;
}

interface VerificationAccordionCardProps {
  company: Company;
  alerts?: RiskAlert[];
}

export function VerificationAccordionCard({ company, alerts = [] }: VerificationAccordionCardProps) {
  const certifications = company.certifications ?? [];
  const hasLegalInfo =
    company.verificationStatus ||
    company.regulation ||
    (company.licenses && company.licenses.length > 0) ||
    (company.registryLinks && company.registryLinks.length > 0) ||
    company.registryData;

  const hasCertifications = certifications.length > 0;
  const hasAlerts = alerts && alerts.length > 0;

  // Card zawsze się wyświetla, bo zawsze pokazujemy sekcję alertów

  return (
    <Card className="rounded-2xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-semibold sm:text-2xl">
            Weryfikacja i bezpieczeństwo
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Informacje prawne, weryfikacja, certyfikaty i alerty ryzyka dotyczące firmy.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerty ryzyka - zawsze wyświetlane */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-base font-semibold">Alerty ryzyka</h3>
          </div>
          {hasAlerts ? (
            <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
              {alerts.map((alert) => (
                <RiskAlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3 text-center">
              <p className="text-sm text-muted-foreground">
                Brak alertów ryzyka - firma nie ma znanych problemów lub ostrzeżeń.
              </p>
            </div>
          )}
        </div>
        {(hasLegalInfo || hasCertifications) && (
          <Separator className="bg-border/40" />
        )}

        {(hasLegalInfo || hasCertifications) && (
          <Accordion type="multiple" defaultValue={["legal"]} className="space-y-4">
          {hasLegalInfo && (
            <AccordionItem
              value="legal"
              className="rounded-xl border border-border/40 bg-muted/20 px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <span className="text-base font-semibold">Informacje prawne i weryfikacja</span>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <LegalVerificationSection company={company} withoutCard />
              </AccordionContent>
            </AccordionItem>
          )}

          {hasCertifications && (
            <AccordionItem
              value="certifications"
              className="rounded-xl border border-border/40 bg-muted/20 px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <span className="text-base font-semibold">Akredytacje i certyfikaty</span>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <CompanyCertifications certifications={certifications} withoutCard />
              </AccordionContent>
            </AccordionItem>
          )}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

