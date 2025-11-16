"use client";

import { Clock, Award, Layers } from "lucide-react";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

interface PayoutHighlight {
  id: string;
  label: string;
  value: string;
}

interface PayoutHighlightCardProps {
  item: PayoutHighlight;
}

export function PayoutHighlightCard({ item }: PayoutHighlightCardProps) {
  const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    cashback: Award,
    plans: Layers,
    default: Clock,
  };
  const Icon = IconMap[item.id] || IconMap.default;

  return (
    <Card
      variant="gradient"
      className="group relative overflow-hidden rounded-2xl transition-all hover:shadow-[0_35px_80px_-35px_rgba(15,23,42,0.55)]"
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
            <PremiumIcon icon={Icon} variant="glow" size="md" hoverGlow />
          </div>
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {item.label}
          </CardTitle>
        </div>
        <p className="text-2xl font-semibold text-foreground">{item.value}</p>
      </CardHeader>
    </Card>
  );
}
