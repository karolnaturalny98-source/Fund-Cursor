"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CompanyWithDetails, CompanyPlan } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getCompareColor } from "@/lib/compare";

interface PlanFeaturesMatrixProps {
  companies: CompanyWithDetails[];
}

type SortKey = "price" | "maxDrawdown" | "profitTarget" | "leverage" | "minTradingDays";
type SortDirection = "asc" | "desc";

interface PlanRow {
  companyName: string;
  companyId: string;
  plan: CompanyPlan;
}

export function PlanFeaturesMatrix({ companies }: PlanFeaturesMatrixProps) {
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Flatten all plans with company info
  const allPlans = useMemo(() => {
    const plans: PlanRow[] = [];
    companies.forEach((company) => {
      company.plans?.forEach((plan) => {
        plans.push({
          companyName: company.name,
          companyId: company.id,
          plan,
        });
      });
    });
    return plans;
  }, [companies]);

  // Sort plans
  const sortedPlans = useMemo(() => {
    const sorted = [...allPlans].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (sortKey) {
        case "price":
          aVal = Number(a.plan.price);
          bVal = Number(b.plan.price);
          break;
        case "maxDrawdown":
          aVal = a.plan.maxDrawdown ? Number(a.plan.maxDrawdown) : Infinity;
          bVal = b.plan.maxDrawdown ? Number(b.plan.maxDrawdown) : Infinity;
          break;
        case "profitTarget":
          aVal = a.plan.profitTarget ? Number(a.plan.profitTarget) : 0;
          bVal = b.plan.profitTarget ? Number(b.plan.profitTarget) : 0;
          break;
        case "leverage":
          aVal = a.plan.leverage || 0;
          bVal = b.plan.leverage || 0;
          break;
        case "minTradingDays":
          aVal = a.plan.minTradingDays || 0;
          bVal = b.plan.minTradingDays || 0;
          break;
        default:
          return 0;
      }

      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [allPlans, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const SortButton = ({ column }: { column: SortKey }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(column)}
      className="h-8 gap-1"
    >
      {sortKey === column ? (
        sortDirection === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3" />
      )}
    </Button>
  );

  // Find best values for highlighting
  const bestValues = useMemo(() => {
    if (allPlans.length === 0) return {};

    const prices = allPlans.map((p) => Number(p.plan.price));
    const drawdowns = allPlans
      .filter((p) => p.plan.maxDrawdown)
      .map((p) => Number(p.plan.maxDrawdown));
    const targets = allPlans
      .filter((p) => p.plan.profitTarget)
      .map((p) => Number(p.plan.profitTarget));
    const leverages = allPlans.filter((p) => p.plan.leverage).map((p) => p.plan.leverage!);

    return {
      lowestPrice: Math.min(...prices),
      highestDrawdown: Math.max(...drawdowns),
      lowestTarget: Math.min(...targets),
      highestLeverage: Math.max(...leverages),
    };
  }, [allPlans]);

  const getCompanyColor = (companyId: string) => {
    const index = companies.findIndex((c) => c.id === companyId);
    return getCompareColor(index);
  };

  if (allPlans.length === 0) {
    return (
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardContent className="flex h-[200px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Brak planów do wyświetlenia
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
      <CardHeader>
        <CardTitle>Matryca Porównania Planów</CardTitle>
        <CardDescription>
          Szczegółowe porównanie cech wszystkich planów. Kliknij nagłówki kolumn aby sortować.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left text-sm font-semibold">Firma</th>
                <th className="p-3 text-left text-sm font-semibold">Plan</th>
                <th className="p-3 text-left text-sm font-semibold">
                  <div className="flex items-center gap-1">
                    Cena
                    <SortButton column="price" />
                  </div>
                </th>
                <th className="p-3 text-left text-sm font-semibold">Model</th>
                <th className="p-3 text-left text-sm font-semibold">
                  <div className="flex items-center gap-1">
                    Max Drawdown
                    <SortButton column="maxDrawdown" />
                  </div>
                </th>
                <th className="p-3 text-left text-sm font-semibold">
                  <div className="flex items-center gap-1">
                    Cel Zysku
                    <SortButton column="profitTarget" />
                  </div>
                </th>
                <th className="p-3 text-left text-sm font-semibold">
                  <div className="flex items-center gap-1">
                    Dźwignia
                    <SortButton column="leverage" />
                  </div>
                </th>
                <th className="p-3 text-left text-sm font-semibold">Podział Zysku</th>
                <th className="p-3 text-left text-sm font-semibold">
                  <div className="flex items-center gap-1">
                    Min. Dni
                    <SortButton column="minTradingDays" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlans.map((row, idx) => {
                const { plan, companyName, companyId } = row;
                const price = Number(plan.price);
                const isBestPrice = price === bestValues.lowestPrice;

                return (
                  <tr key={`${companyId}-${plan.id}`} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: getCompanyColor(companyId) }}
                        />
                        <span className="text-sm font-medium">{companyName}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{plan.name}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isBestPrice && "text-primary"
                        )}
                      >
                        ${price.toFixed(0)} {plan.currency}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">
                        {plan.evaluationModel}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">
                        {plan.maxDrawdown ? `${Number(plan.maxDrawdown).toFixed(0)}%` : "-"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">
                        {plan.profitTarget ? `${Number(plan.profitTarget).toFixed(0)}%` : "-"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{plan.leverage ? `${plan.leverage}:1` : "-"}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{plan.profitSplit || "-"}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{plan.minTradingDays || "-"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

