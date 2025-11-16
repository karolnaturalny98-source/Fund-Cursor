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
    <div className="space-y-[clamp(1.5rem,2.2vw,2.25rem)]">
      <div>
        <h2 className="fluid-h2 font-bold">Warunki Handlowe</h2>
        <p className="fluid-copy text-muted-foreground">
          Szczegółowe porównanie instrumentów, dźwigni i prowizji
        </p>
      </div>

      {/* Instruments Comparison */}
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-[clamp(0.65rem,0.95vw,0.9rem)] text-[clamp(1rem,0.45vw+0.9rem,1.2rem)]">
            <TrendingUp className="h-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)] w-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)]" />
            Dostępne Instrumenty
          </CardTitle>
          <CardDescription className="fluid-caption">
            Porównanie instrumentów handlowych oferowanych przez każdą firmę
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-[clamp(1rem,1.4vw,1.3rem)] border-[var(--border-color)]"
                style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
              >
                <h4 className="mb-[clamp(0.65rem,1vw,0.9rem)] text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold text-foreground">
                  {company.name}
                </h4>
                
                {/* Instrument Groups */}
                {company.instrumentGroups && company.instrumentGroups.length > 0 ? (
                  <div className="space-y-[clamp(0.75rem,1.2vw,1rem)]">
                    {company.instrumentGroups.map((group, groupIdx) => (
                      <div key={groupIdx} className="space-y-[clamp(0.45rem,0.7vw,0.65rem)]">
                        <p className="text-[clamp(0.95rem,0.4vw+0.85rem,1.05rem)] font-medium text-foreground">
                          {group.title}
                        </p>
                        {group.description && (
                          <p className="fluid-caption text-muted-foreground">
                            {group.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-[clamp(0.4rem,0.6vw,0.55rem)]">
                          {group.instruments.map((instrument, instIdx) => (
                            <Badge key={instIdx} variant="secondary" className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] font-medium">
                              {instrument}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : company.instruments && company.instruments.length > 0 ? (
                  <div className="flex flex-wrap gap-[clamp(0.4rem,0.6vw,0.55rem)]">
                    {company.instruments.map((instrument, instIdx) => (
                      <Badge key={instIdx} variant="secondary" className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] font-medium">
                        {instrument}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="fluid-copy text-muted-foreground">
                    Brak szczegółowych informacji
                  </p>
                )}

                <div className="mt-[clamp(0.65rem,1vw,0.9rem)] text-muted-foreground fluid-caption">
                  <span className="font-semibold text-foreground">
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
          <CardTitle className="flex items-center gap-[clamp(0.65rem,0.95vw,0.9rem)] text-[clamp(1rem,0.45vw+0.9rem,1.2rem)]">
            <TrendingUp className="h-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)] w-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)]" />
            Poziomy Dźwigni
          </CardTitle>
          <CardDescription className="fluid-caption">
            Dostępne poziomy dźwigni dla różnych wielkości kont
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-[clamp(1rem,1.4vw,1.3rem)] border-[var(--border-color)]"
                style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
              >
                <h4 className="mb-[clamp(0.65rem,1vw,0.9rem)] text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold text-foreground">
                  {company.name}
                </h4>
                
                {company.leverageTiers && company.leverageTiers.length > 0 ? (
                  <div className="space-y-[clamp(0.5rem,0.8vw,0.7rem)]">
                    {company.leverageTiers.map((tier, tierIdx) => (
                      <div
                        key={tierIdx}
                        className="flex items-center justify-between rounded bg-muted/50 p-[clamp(0.65rem,0.95vw,0.85rem)]"
                      >
                        <div>
                          <p className="text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground">
                            {tier.label}
                          </p>
                          {tier.accountSize && (
                            <p className="fluid-caption text-muted-foreground">
                              {tier.accountSize}
                            </p>
                          )}
                        </div>
                        {tier.maxLeverage && (
                          <Badge variant="default" className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] font-semibold">
                            {tier.maxLeverage}:1
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="fluid-copy text-muted-foreground">
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
          <CardTitle className="flex items-center gap-[clamp(0.65rem,0.95vw,0.9rem)] text-[clamp(1rem,0.45vw+0.9rem,1.2rem)]">
            <DollarSign className="h-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)] w-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)]" />
            Prowizje Handlowe
          </CardTitle>
          <CardDescription className="fluid-caption">
            Porównanie prowizji dla różnych rynków
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-[clamp(1rem,1.4vw,1.3rem)] border-[var(--border-color)]"
                style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
              >
                <h4 className="mb-[clamp(0.65rem,1vw,0.9rem)] text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold text-foreground">
                  {company.name}
                </h4>
                
                {company.tradingCommissions && company.tradingCommissions.length > 0 ? (
                  <div className="space-y-[clamp(0.5rem,0.8vw,0.7rem)]">
                    {company.tradingCommissions.map((commission, commIdx) => (
                      <div key={commIdx} className="space-y-1">
                        <div className="flex items-start justify-between gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                          <span className="text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground">{commission.market}</span>
                          <span className="text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-bold text-foreground">{commission.value}</span>
                        </div>
                        {commission.notes && (
                          <p className="fluid-caption text-muted-foreground">
                            {commission.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="fluid-copy text-muted-foreground">
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
          <CardTitle className="flex items-center gap-[clamp(0.65rem,0.95vw,0.9rem)] text-[clamp(1rem,0.45vw+0.9rem,1.2rem)]">
            <Laptop className="h-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)] w-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)]" />
            Platformy Handlowe
          </CardTitle>
          <CardDescription className="fluid-caption">
            Dostępne platformy do handlu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-[clamp(1rem,1.4vw,1.3rem)] border-[var(--border-color)]"
                style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
              >
                <h4 className="mb-[clamp(0.65rem,1vw,0.9rem)] text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold text-foreground">
                  {company.name}
                </h4>
                
                {company.platforms && company.platforms.length > 0 ? (
                  <div className="flex flex-wrap gap-[clamp(0.4rem,0.6vw,0.55rem)]">
                    {company.platforms.map((platform, platIdx) => (
                      <Badge key={platIdx} variant="outline" className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] font-medium">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="fluid-copy text-muted-foreground">
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
          <CardTitle className="text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold">Zasady Handlu</CardTitle>
          <CardDescription className="fluid-caption">
            Dozwolone i zabronione strategie handlowe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-[clamp(1rem,1.4vw,1.3rem)] border-[var(--border-color)]"
                style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
              >
                <h4 className="mb-[clamp(0.75rem,1.1vw,1rem)] text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold text-foreground">
                  {company.name}
                </h4>
                
                <div className="space-y-[clamp(0.9rem,1.3vw,1.2rem)]">
                  {/* Allowed */}
                  {company.firmRules?.allowed && company.firmRules.allowed.length > 0 && (
                    <div>
                      <p className="mb-[clamp(0.4rem,0.6vw,0.55rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-green-600">
                        ✓ Dozwolone
                      </p>
                      <ul className="space-y-[clamp(0.35rem,0.5vw,0.45rem)]">
                        {company.firmRules.allowed.map((rule, ruleIdx) => (
                          <li key={ruleIdx} className="fluid-copy text-muted-foreground">
                            • {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Restricted */}
                  {company.firmRules?.restricted && company.firmRules.restricted.length > 0 && (
                    <div>
                      <p className="mb-[clamp(0.4rem,0.6vw,0.55rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-red-600">
                        ✗ Zabronione
                      </p>
                      <ul className="space-y-[clamp(0.35rem,0.5vw,0.45rem)]">
                        {company.firmRules.restricted.map((rule, ruleIdx) => (
                          <li key={ruleIdx} className="fluid-copy text-muted-foreground">
                            • {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(!company.firmRules?.allowed || company.firmRules.allowed.length === 0) &&
                    (!company.firmRules?.restricted || company.firmRules.restricted.length === 0) && (
                      <p className="fluid-copy text-muted-foreground">
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

