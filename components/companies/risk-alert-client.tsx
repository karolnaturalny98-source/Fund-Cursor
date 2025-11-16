"use client";

import { AlertTriangle, Shield, LifeBuoy, Zap } from "lucide-react";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import React from "react";
import { Surface } from "@/components/ui/surface";

interface RiskAlert {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  iconName: string;
}

interface RiskAlertCardProps {
  alert: RiskAlert;
}

export function RiskAlertCard({ alert }: RiskAlertCardProps) {
  const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    AlertTriangle,
    Shield,
    LifeBuoy,
    Zap,
  };
  const Icon = IconMap[alert.iconName] || AlertTriangle;

  const severityStyles = {
    high: {
      variant: "destructive" as const,
      className: "border-rose-500/60 bg-rose-500/10",
      iconColor: "text-rose-600",
    },
    medium: {
      variant: "default" as const,
      className: "border-amber-500/50 bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    low: {
      variant: "default" as const,
      className: "border-sky-500/50 bg-sky-500/10",
      iconColor: "text-sky-600",
    },
  };

  const style = severityStyles[alert.severity];

  return (
    <Surface
      asChild
      variant="gradient"
      className={cn(
        "rounded-2xl transition-all hover:shadow-[0_35px_80px_-35px_rgba(15,23,42,0.55)]",
        style.className,
      )}
    >
      <Alert variant={style.variant} className="rounded-2xl border-transparent bg-transparent shadow-none">
        <PremiumIcon icon={Icon} variant="glow" size="md" className={style.iconColor} />
        <AlertTitle className="text-sm font-semibold">{alert.title}</AlertTitle>
        <AlertDescription className="mt-2 text-xs leading-relaxed">{alert.description}</AlertDescription>
      </Alert>
    </Surface>
  );
}
