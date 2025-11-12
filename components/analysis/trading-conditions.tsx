"use client";

import { TrendingUp, DollarSign, Laptop } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCompareColor } from "@/lib/compare";
import type { CompanyWithDetails } from "@/lib/types";

interface TradingConditionsProps {
  companies: CompanyWithDetails[];
}

export function TradingConditions({ companies }: TradingConditionsProps) {
  const getCompanyColor = (index: number) => getCompareColor(index);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Warunki Handlowe</h2>
        <p className="text-sm text-muted-foreground">
          Szczegółowe porównanie instrumentów, dźwigni i prowizji
        </p>
      </div>

      {/* Instruments Comparison */}
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Dostępne Instrumenty
          </CardTitle>
          <CardDescription>
            Porównanie instrumentów handlowych oferowanych przez każdą firmę
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-4 border-[var(--border-color)]"
                style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
              >
                <h4 className="mb-3 font-semibold">{company.name}</h4>
                
                {/* Instrument Groups */}
                {company.instrumentGroups && company.instrumentGroups.length > 0 ? (
                  <div className="space-y-3">
                    {company.instrumentGroups.map((group, groupIdx) => (
                      <div key={groupIdx} className="space-y-2">
                        <p className="text-sm font-medium">{group.title}</p>
                        {group.description && (
                          <p className="text-xs text-muted-foreground">
                            {group.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {group.instruments.map((instrument, instIdx) => (
                            <Badge key={instIdx} variant="secondary" className="text-xs">
                              {instrument}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : company.instruments && company.instruments.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {company.instruments.map((instrument, instIdx) => (
                      <Badge key={instIdx} variant="secondary" className="text-xs">
                        {instrument}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Brak szczegółowych informacji
                  </p>
                )}

                <div className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium">
                    {company.instruments.length} instrumentów
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leverage Tiers */}
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Poziomy Dźwigni
          </CardTitle>
          <CardDescription>
            Dostępne poziomy dźwigni dla różnych wielkości kont
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-4 border-[var(--border-color)]"
                style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
              >
                <h4 className="mb-3 font-semibold">{company.name}</h4>
                
                {company.leverageTiers && company.leverageTiers.length > 0 ? (
                  <div className="space-y-2">
                    {company.leverageTiers.map((tier, tierIdx) => (
                      <div
                        key={tierIdx}
                        className="flex items-center justify-between rounded bg-muted/50 p-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{tier.label}</p>
                          {tier.accountSize && (
                            <p className="text-xs text-muted-foreground">
                              {tier.accountSize}
                            </p>
                          )}
                        </div>
                        {tier.maxLeverage && (
                          <Badge variant="default" className="font-semibold">
                            {tier.maxLeverage}:1
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Brak szczegółowych informacji o dźwigni
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Commissions */}
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Prowizje Handlowe
          </CardTitle>
          <CardDescription>
            Porównanie prowizji dla różnych rynków
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-4 border-[var(--border-color)]"
                style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
              >
                <h4 className="mb-3 font-semibold">{company.name}</h4>
                
                {company.tradingCommissions && company.tradingCommissions.length > 0 ? (
                  <div className="space-y-2">
                    {company.tradingCommissions.map((commission, commIdx) => (
                      <div key={commIdx} className="space-y-1">
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-medium">{commission.market}</span>
                          <span className="text-sm font-bold">{commission.value}</span>
                        </div>
                        {commission.notes && (
                          <p className="text-xs text-muted-foreground">
                            {commission.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Brak szczegółowych informacji o prowizjach
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platforms */}
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5" />
            Platformy Handlowe
          </CardTitle>
          <CardDescription>
            Dostępne platformy do handlu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-4 border-[var(--border-color)]"
                style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
              >
                <h4 className="mb-3 font-semibold">{company.name}</h4>
                
                {company.platforms && company.platforms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {company.platforms.map((platform, platIdx) => (
                      <Badge key={platIdx} variant="outline" className="text-sm">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Brak informacji o platformach
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Rules */}
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle>Zasady Handlu</CardTitle>
          <CardDescription>
            Dozwolone i zabronione strategie handlowe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-4 border-[var(--border-color)]"
                style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
              >
                <h4 className="mb-4 font-semibold">{company.name}</h4>
                
                <div className="space-y-4">
                  {/* Allowed */}
                  {company.firmRules?.allowed && company.firmRules.allowed.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-green-600">
                        ✓ Dozwolone
                      </p>
                      <ul className="space-y-1">
                        {company.firmRules.allowed.map((rule, ruleIdx) => (
                          <li key={ruleIdx} className="text-sm text-muted-foreground">
                            • {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Restricted */}
                  {company.firmRules?.restricted && company.firmRules.restricted.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-red-600">
                        ✗ Zabronione
                      </p>
                      <ul className="space-y-1">
                        {company.firmRules.restricted.map((rule, ruleIdx) => (
                          <li key={ruleIdx} className="text-sm text-muted-foreground">
                            • {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(!company.firmRules?.allowed || company.firmRules.allowed.length === 0) &&
                    (!company.firmRules?.restricted || company.firmRules.restricted.length === 0) && (
                      <p className="text-sm text-muted-foreground">
                        Brak szczegółowych informacji o zasadach
                      </p>
                    )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

