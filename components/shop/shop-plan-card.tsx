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
      <div className="p-[clamp(1.1rem,1.6vw,1.4rem)]">
        <div className="flex items-start justify-between gap-[clamp(0.85rem,1.2vw,1.05rem)]">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-[clamp(0.45rem,0.7vw,0.6rem)]">
              <h3 className="font-semibold text-foreground fluid-copy">{plan.name}</h3>
              {isSelected && (
                <Badge variant="default" className="fluid-badge rounded-full">
                  <Check className="mr-1 h-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)] w-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)]" />
                  Wybrany
                </Badge>
              )}
              {isBestValue && !isSelected && (
                <Badge variant="outline" className="fluid-badge rounded-full">
                  <Sparkles className="mr-1 h-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)] w-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)]" />
                  Najlepsza wartość
                </Badge>
              )}
            </div>
            {plan.description && (
              <p className="mt-[clamp(0.45rem,0.65vw,0.6rem)] text-muted-foreground fluid-caption line-clamp-2">
                {plan.description}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-[clamp(1.75rem,2.2vw,2.1rem)] font-semibold text-foreground">
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
          "mt-[clamp(0.85rem,1.2vw,1.05rem)] rounded-2xl border p-[clamp(0.9rem,1.3vw,1.15rem)] transition-colors",
          isSelected 
            ? "border-primary/50 bg-primary/10" 
            : "border-border/60 bg-linear-to-br from-primary/5 to-primary/10"
        )}
        >
          <div className="flex items-center justify-between gap-[clamp(0.75rem,1.1vw,1rem)]">
            <div>
              <div className="font-medium text-muted-foreground uppercase tracking-[0.2em] fluid-caption">
                Cashback
              </div>
              <div className="mt-[clamp(0.4rem,0.6vw,0.5rem)] flex items-baseline gap-[clamp(0.35rem,0.5vw,0.45rem)]">
                <span className="text-[clamp(1.75rem,2.2vw,2.1rem)] font-semibold text-primary leading-none">
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
              <div className="rounded-full bg-primary/20 p-[clamp(0.5rem,0.75vw,0.65rem)]">
                <Sparkles className="h-[clamp(1.1rem,0.6vw+0.95rem,1.3rem)] w-[clamp(1.1rem,0.6vw+0.95rem,1.3rem)] text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
