"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyWithPlans } from "@/lib/queries/companies";
import type { CompanyPlan } from "@/lib/types";

interface ShopPlanCardProps {
  plan: CompanyPlan;
  company: CompanyWithPlans;
  isSelected: boolean;
  onSelect: () => void;
}

export function ShopPlanCard({
  plan,
  company,
  isSelected,
  onSelect,
}: ShopPlanCardProps) {
  const price = Number(plan.price);
  const cashbackRate = company.cashbackRate ?? 0;
  const cashbackAmount = Math.round((price * cashbackRate) / 100);
  const isBestValue = cashbackRate >= 10; // Consider 10%+ as best value

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:scale-[1.02]",
        isSelected && "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
      )}
      onClick={onSelect}
    >
      <div className="fluid-card-pad-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground fluid-copy">{plan.name}</h3>
              {isSelected && (
                <Badge variant="default" className="fluid-pill text-xs font-medium">
                  <Check className="mr-1 fluid-icon-sm" />
                  Wybrany
                </Badge>
              )}
              {isBestValue && !isSelected && (
                <Badge variant="outline" className="fluid-pill text-xs font-medium">
                  <Sparkles className="mr-1 fluid-icon-sm" />
                  Najlepsza wartość
                </Badge>
              )}
            </div>
            {plan.description && (
              <p className="text-muted-foreground fluid-caption line-clamp-2">
                {plan.description}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="font-semibold text-foreground fluid-h2 leading-tight">
              ${price.toLocaleString("pl-PL")}
            </div>
            <div className="text-muted-foreground uppercase fluid-caption">
              {plan.currency}
            </div>
          </div>
        </div>

        {/* Prominent Cashback Display */}
        <div
          className={cn(
            "rounded-2xl border fluid-card-pad-sm transition-colors",
            isSelected
              ? "border-primary/50 bg-primary/10"
              : "border-border/60 bg-linear-to-br from-primary/5 to-primary/10",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-muted-foreground uppercase tracking-[0.2em] fluid-caption">
                Cashback
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-semibold text-primary fluid-h2 leading-none">
                  ${cashbackAmount.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {cashbackRate > 0 && (
                  <span className="font-semibold text-primary/70 fluid-caption">
                    ({cashbackRate}%)
                  </span>
                )}
              </div>
            </div>
            {cashbackAmount > 0 && (
              <div className="rounded-full bg-primary/20 p-3">
                <Sparkles className="fluid-icon-md text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
