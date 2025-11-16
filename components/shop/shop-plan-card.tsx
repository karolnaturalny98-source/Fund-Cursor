"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyWithPlans } from "@/lib/queries/companies";
import type { CompanyPlan } from "@/lib/types";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

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
      variant={isSelected ? "elevated" : "muted"}
      className={cn(
        "cursor-pointer transition-all duration-200",
        !isSelected && "hover:border-primary/50 hover:shadow-md",
        isSelected && "border-primary/60 ring-2 ring-primary/20"
      )}
      onClick={onSelect}
    >
      <div className="fluid-card-pad-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Heading level={3} variant="subsection">
                {plan.name}
              </Heading>
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
              <Text variant="caption" tone="muted" className="line-clamp-2">
                {plan.description}
              </Text>
            )}
          </div>
          <div className="text-right shrink-0">
            <Text variant="stat" className="leading-tight">
              ${price.toLocaleString("pl-PL")}
            </Text>
            <Text variant="caption" tone="muted" className="uppercase">
              {plan.currency}
            </Text>
          </div>
        </div>

        {/* Prominent Cashback Display */}
        <Surface
          variant={isSelected ? "stats" : "panel"}
          padding="sm"
          className={cn(
            "transition-colors",
            isSelected ? "border-primary/40 bg-primary/10" : "bg-linear-to-br from-primary/5 to-primary/10"
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <Text variant="caption" tone="muted" className="font-medium uppercase tracking-[0.2em]">
                Cashback
              </Text>
              <div className="mt-2 flex items-baseline gap-2">
                <Text variant="stat" tone="primary" className="leading-none">
                  ${cashbackAmount.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                {cashbackRate > 0 && (
                  <Text variant="caption" tone="primary" className="text-primary/70 font-semibold">
                    ({cashbackRate}%)
                  </Text>
                )}
              </div>
            </div>
            {cashbackAmount > 0 && (
              <div className="rounded-full bg-primary/20 p-3">
                <Sparkles className="fluid-icon-md text-primary" />
              </div>
            )}
          </div>
        </Surface>
      </div>
    </Card>
  );
}
