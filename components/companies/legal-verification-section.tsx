"use client";

import { ShieldCheck, FileCheck, ExternalLink, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import { Separator } from "@/components/ui/separator";
import { PremiumBadge } from "@/components/custom/premium-badge";
import type { Company } from "@/lib/types";

interface LegalVerificationSectionProps {
  company: Company;
  withoutCard?: boolean;
}

function getVerificationStatusBadge(status: string | null | undefined) {
  switch (status) {
    case "VERIFIED":
      return (
        <PremiumBadge variant="glow" className="rounded-full bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Zweryfikowana
        </PremiumBadge>
      );
    case "PENDING":
      return (
        <PremiumBadge variant="glow" className="rounded-full bg-amber-500/20 text-amber-400 border-amber-500/30">
          <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
          W trakcie weryfikacji
        </PremiumBadge>
      );
    case "UNVERIFIED":
      return (
        <PremiumBadge variant="outline" className="rounded-full text-muted-foreground">
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          Niezweryfikowana
        </PremiumBadge>
      );
    default:
      return null;
  }
}

export function LegalVerificationSection({ company, withoutCard = false }: LegalVerificationSectionProps) {
  const hasVerificationInfo =
    company.verificationStatus ||
    company.regulation ||
    (company.licenses && company.licenses.length > 0) ||
    (company.registryLinks && company.registryLinks.length > 0) ||
    company.registryData ||
    company.kycRequired !== undefined;

  if (!hasVerificationInfo) {
    return null;
  }

  const content = (
    <div className="space-y-4">
        {company.verificationStatus ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              <span>Status weryfikacji</span>
            </div>
            <div>{getVerificationStatusBadge(company.verificationStatus)}</div>
          </div>
        ) : null}

        {company.verificationStatus && (company.regulation || company.licenses?.length || company.registryLinks?.length || company.registryData || company.kycRequired !== undefined) ? (
          <Separator className="bg-border/40" />
        ) : null}

        {company.regulation ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileCheck className="h-4 w-4" />
              <span>Regulacja</span>
            </div>
            <p className="text-sm text-foreground">{company.regulation}</p>
          </div>
        ) : null}

        {company.regulation && (company.licenses?.length || company.registryLinks?.length || company.registryData || company.kycRequired !== undefined) ? (
          <Separator className="bg-border/40" />
        ) : null}

        {company.licenses && company.licenses.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileCheck className="h-4 w-4" />
              <span>Licencje i uprawnienia</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {company.licenses.map((license, index) => (
                <Surface
                  key={index}
                  variant="gradient"
                  padding="pill"
                  className="rounded-full text-xs font-medium"
                >
                  {license}
                </Surface>
              ))}
            </div>
          </div>
        ) : null}

        {company.licenses?.length && (company.registryLinks?.length || company.registryData || company.kycRequired !== undefined) ? (
          <Separator className="bg-border/40" />
        ) : null}

        {company.registryLinks && company.registryLinks.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              <span>Linki do rejestrów firm</span>
            </div>
            <div className="flex flex-col gap-2">
              {company.registryLinks.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="break-all">{link}</span>
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {company.registryLinks?.length && (company.registryData || company.kycRequired !== undefined) ? (
          <Separator className="bg-border/40" />
        ) : null}

        {company.registryData ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileCheck className="h-4 w-4" />
              <span>Dane rejestrowe</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{company.registryData}</p>
          </div>
        ) : null}

        {company.registryData && company.kycRequired !== undefined ? (
          <Separator className="bg-border/40" />
        ) : null}

        {company.kycRequired !== undefined ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              <span>Wymagane KYC</span>
            </div>
            <div>
              {company.kycRequired ? (
                <Badge variant="outline" className="rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Tak
                </Badge>
              ) : (
                <Badge variant="outline" className="rounded-full text-muted-foreground">
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  Nie
                </Badge>
              )}
            </div>
          </div>
        ) : null}
    </div>
  );

  if (withoutCard) {
    return content;
  }

  return (
    <Card variant="gradient" className="rounded-2xl backdrop-blur-[36px]!">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-semibold sm:text-2xl">
            Weryfikacja prawna
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Szczegółowa analiza prawna i weryfikacja firmy.
        </p>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
