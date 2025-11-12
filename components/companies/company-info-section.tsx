"use client";

import { Building2, MapPin, User, Users, Calendar, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Company } from "@/lib/types";

interface CompanyInfoSectionProps {
  company: Company;
}

export function CompanyInfoSection({ company }: CompanyInfoSectionProps) {
  const hasAnyInfo =
    company.legalName ||
    company.ceo ||
    company.headquartersAddress ||
    company.foundersInfo ||
    company.foundedYear ||
    company.country;

  if (!hasAnyInfo) {
    return null;
  }

  return (
    <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium backdrop-blur-[36px]!">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-semibold sm:text-2xl">
            Informacje o firmie
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Podstawowe dane firmowe i kontaktowe.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {company.legalName ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>Nazwa prawna</span>
            </div>
            <p className="text-base font-semibold text-foreground">{company.legalName}</p>
          </div>
        ) : null}

        {(company.legalName && (company.ceo || company.headquartersAddress || company.foundersInfo || company.foundedYear || company.country)) ? (
          <Separator className="bg-border/40" />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {company.ceo ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                <span>CEO</span>
              </div>
              <p className="text-sm text-foreground">{company.ceo}</p>
            </div>
          ) : null}

          {company.foundedYear ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Rok założenia</span>
              </div>
              <p className="text-sm text-foreground">{company.foundedYear}</p>
            </div>
          ) : null}

          {company.country ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>Kraj</span>
              </div>
              <p className="text-sm text-foreground">{company.country}</p>
            </div>
          ) : null}
        </div>

        {company.headquartersAddress ? (
          <>
            {(company.ceo || company.foundedYear || company.country) ? (
              <Separator className="bg-border/40" />
            ) : null}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Adres siedziby</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{company.headquartersAddress}</p>
            </div>
          </>
        ) : null}

        {company.foundersInfo ? (
          <>
            {(company.ceo || company.headquartersAddress || company.foundedYear || company.country) ? (
              <Separator className="bg-border/40" />
            ) : null}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Założyciele</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{company.foundersInfo}</p>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

