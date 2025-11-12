"use client";

import { useState } from "react";
import { GitCompare, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFadeIn } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { CompanyWithDetails } from "@/lib/types";

interface PayoutsComparisonProps {
  company: CompanyWithDetails;
}

export function PayoutsComparison({ company }: PayoutsComparisonProps) {
  const sectionAnim = useFadeIn({ rootMargin: "-50px" });
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);

  const togglePlan = (planId: string) => {
    setSelectedPlans((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : prev.length < 3 ? [...prev, planId] : prev
    );
  };

  const selectedPlansData = company.plans.filter((plan) => selectedPlans.includes(plan.id));

  if (company.plans.length < 2) {
    return null;
  }

  return (
    <div ref={sectionAnim.ref} className={cn("space-y-4", sectionAnim.className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold sm:text-xl">Porównanie planów</h2>
          <p className="text-xs text-muted-foreground">
            Wybierz do 3 planów, aby porównać ich parametry wypłat.
          </p>
        </div>
        {selectedPlans.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedPlans([])}
            className="text-xs"
          >
            <X className="mr-2 h-3 w-3" />
            Wyczyść
          </Button>
        )}
      </div>

      {/* Plan selection */}
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {company.plans.map((plan) => {
          const isSelected = selectedPlans.includes(plan.id);
          return (
            <Card
              key={plan.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50 hover:shadow-md",
                isSelected
                  ? "border-primary/50 bg-primary/5 shadow-md"
                  : "border-border/40 bg-[rgba(12,14,18,0.6)]"
              )}
              onClick={() => togglePlan(plan.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{plan.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {plan.evaluationModel === "one-step"
                        ? "1-etapowe"
                        : plan.evaluationModel === "two-step"
                          ? "2-etapowe"
                          : plan.evaluationModel === "instant-funding"
                            ? "Instant"
                            : plan.evaluationModel}
                    </p>
                  </div>
                  {isSelected && (
                    <Badge variant="outline" className="shrink-0 text-[10px] bg-primary/10 text-primary border-primary/30">
                      Wybrane
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison table */}
      {selectedPlansData.length > 0 && (
        <Card className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Porównanie</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Szczegółowe porównanie parametrów wypłat dla wybranych planów
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="px-3 py-2 text-left font-semibold text-foreground">Parametr</th>
                    {selectedPlansData.map((plan) => (
                      <th key={plan.id} className="px-3 py-2 text-left font-semibold text-foreground">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/20">
                    <td className="px-3 py-2 text-muted-foreground">Pierwsza wypłata</td>
                    {selectedPlansData.map((plan) => (
                      <td key={plan.id} className="px-3 py-2 text-foreground">
                        {plan.payoutFirstAfterDays
                          ? `${plan.payoutFirstAfterDays} ${plan.payoutFirstAfterDays === 1 ? "dzień" : "dni"}`
                          : "Brak danych"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/20">
                    <td className="px-3 py-2 text-muted-foreground">Cykl wypłat</td>
                    {selectedPlansData.map((plan) => (
                      <td key={plan.id} className="px-3 py-2 text-foreground">
                        {plan.payoutCycleDays
                          ? `${plan.payoutCycleDays} ${plan.payoutCycleDays === 1 ? "dzień" : "dni"}`
                          : "Brak danych"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/20">
                    <td className="px-3 py-2 text-muted-foreground">Profit split</td>
                    {selectedPlansData.map((plan) => (
                      <td key={plan.id} className="px-3 py-2 text-foreground">
                        {plan.profitSplit || "Brak danych"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/20">
                    <td className="px-3 py-2 text-muted-foreground">Model oceny</td>
                    {selectedPlansData.map((plan) => (
                      <td key={plan.id} className="px-3 py-2 text-foreground">
                        {plan.evaluationModel === "one-step"
                          ? "1-etapowe"
                          : plan.evaluationModel === "two-step"
                            ? "2-etapowe"
                            : plan.evaluationModel === "instant-funding"
                              ? "Instant"
                              : plan.evaluationModel}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

