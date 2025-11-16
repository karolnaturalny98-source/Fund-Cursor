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
    <Card variant="gradient" className="rounded-2xl backdrop-blur-[36px]!">
      <CardHeader className="space-y-[clamp(0.5rem,0.75vw,0.7rem)]">
        <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.6rem)]">
          <Building2 className="h-[clamp(1.2rem,0.5vw+1rem,1.4rem)] w-[clamp(1.2rem,0.5vw+1rem,1.4rem)] text-primary" />
          <CardTitle className="font-semibold text-foreground fluid-h2">
            Informacje o firmie
          </CardTitle>
        </div>
        <p className="text-muted-foreground fluid-caption">
          Podstawowe dane firmowe i kontaktowe.
        </p>
      </CardHeader>
      <CardContent className="space-y-[clamp(1rem,1.5vw,1.35rem)]">
        {company.legalName ? (
          <div className="space-y-[clamp(0.35rem,0.6vw,0.5rem)]">
            <div className="flex items-center gap-[clamp(0.4rem,0.65vw,0.55rem)] font-medium text-muted-foreground fluid-caption">
              <Building2 className="h-[clamp(1rem,0.45vw+0.85rem,1.2rem)] w-[clamp(1rem,0.45vw+0.85rem,1.2rem)]" />
              <span>Nazwa prawna</span>
            </div>
            <p className="font-semibold text-foreground fluid-copy">{company.legalName}</p>
          </div>
        ) : null}

        {(company.legalName && (company.ceo || company.headquartersAddress || company.foundersInfo || company.foundedYear || company.country)) ? (
          <Separator className="bg-border/40" />
        ) : null}

        <div className="grid gap-[clamp(0.85rem,1.3vw,1.1rem)] sm:grid-cols-2">
          {company.ceo ? (
            <div className="space-y-[clamp(0.35rem,0.6vw,0.5rem)]">
              <div className="flex items-center gap-[clamp(0.4rem,0.65vw,0.55rem)] font-medium text-muted-foreground fluid-caption">
                <User className="h-[clamp(1rem,0.45vw+0.85rem,1.2rem)] w-[clamp(1rem,0.45vw+0.85rem,1.2rem)]" />
                <span>CEO</span>
              </div>
              <p className="text-foreground fluid-copy">{company.ceo}</p>
            </div>
          ) : null}

          {company.foundedYear ? (
            <div className="space-y-[clamp(0.35rem,0.6vw,0.5rem)]">
              <div className="flex items-center gap-[clamp(0.4rem,0.65vw,0.55rem)] font-medium text-muted-foreground fluid-caption">
                <Calendar className="h-[clamp(1rem,0.45vw+0.85rem,1.2rem)] w-[clamp(1rem,0.45vw+0.85rem,1.2rem)]" />
                <span>Rok założenia</span>
              </div>
              <p className="text-foreground fluid-copy">{company.foundedYear}</p>
            </div>
          ) : null}

          {company.country ? (
            <div className="space-y-[clamp(0.35rem,0.6vw,0.5rem)]">
              <div className="flex items-center gap-[clamp(0.4rem,0.65vw,0.55rem)] font-medium text-muted-foreground fluid-caption">
                <Globe className="h-[clamp(1rem,0.45vw+0.85rem,1.2rem)] w-[clamp(1rem,0.45vw+0.85rem,1.2rem)]" />
                <span>Kraj</span>
              </div>
              <p className="text-foreground fluid-copy">{company.country}</p>
            </div>
          ) : null}
        </div>

        {company.headquartersAddress ? (
          <>
            {(company.ceo || company.foundedYear || company.country) ? (
              <Separator className="bg-border/40" />
            ) : null}
            <div className="space-y-[clamp(0.35rem,0.6vw,0.5rem)]">
              <div className="flex items-center gap-[clamp(0.4rem,0.65vw,0.55rem)] font-medium text-muted-foreground fluid-caption">
                <MapPin className="h-[clamp(1rem,0.45vw+0.85rem,1.2rem)] w-[clamp(1rem,0.45vw+0.85rem,1.2rem)]" />
                <span>Adres siedziby</span>
              </div>
              <p className="text-foreground leading-relaxed fluid-copy">{company.headquartersAddress}</p>
            </div>
          </>
        ) : null}

        {company.foundersInfo ? (
          <>
            {(company.ceo || company.headquartersAddress || company.foundedYear || company.country) ? (
              <Separator className="bg-border/40" />
            ) : null}
            <div className="space-y-[clamp(0.35rem,0.6vw,0.5rem)]">
              <div className="flex items-center gap-[clamp(0.4rem,0.65vw,0.55rem)] font-medium text-muted-foreground fluid-caption">
                <Users className="h-[clamp(1rem,0.45vw+0.85rem,1.2rem)] w-[clamp(1rem,0.45vw+0.85rem,1.2rem)]" />
                <span>Założyciele</span>
              </div>
              <p className="text-foreground leading-relaxed fluid-copy">{company.foundersInfo}</p>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
