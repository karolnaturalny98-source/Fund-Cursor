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
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              {isSelected && (
                <Badge variant="default" className="rounded-full">
                  <Check className="mr-1 h-3 w-3" />
                  Wybrany
                </Badge>
              )}
              {isBestValue && !isSelected && (
                <Badge variant="outline" className="rounded-full">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Najlepsza wartość
                </Badge>
              )}
            </div>
            {plan.description && (
              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                {plan.description}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold">
              ${price.toLocaleString("pl-PL")}
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              {plan.currency}
            </div>
          </div>
        </div>

        {/* Prominent Cashback Display */}
        <div className={cn(
          "mt-4 rounded-xl border p-4 transition-colors",
          isSelected 
            ? "border-primary/50 bg-primary/10" 
            : "border-border/60 bg-linear-to-br from-primary/5 to-primary/10"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cashback
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-primary">
                  ${cashbackAmount.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {cashbackRate > 0 && (
                  <span className="text-sm font-semibold text-primary/70">
                    ({cashbackRate}%)
                  </span>
                )}
              </div>
            </div>
            {cashbackAmount > 0 && (
              <div className="rounded-full bg-primary/20 p-2">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
