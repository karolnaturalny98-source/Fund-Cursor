"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Text } from "@/components/ui/text";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = "default",
}: MetricCardProps) {
  const variantStyles = {
    default: "border-border/60",
    primary: "border-primary/30 bg-primary/5",
    success: "border-emerald-500/30 bg-emerald-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    danger: "border-destructive/30 bg-destructive/5",
  };

  const iconColors = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-emerald-500",
    warning: "text-yellow-500",
    danger: "text-destructive",
  };

  return (
    <Card
      className={cn(
        "rounded-2xl border bg-card/72 backdrop-blur-[36px]! transition-all duration-200 hover:shadow-md",
        variantStyles[variant],
        className
      )}
    >
      <CardHeader className="px-[clamp(1.1rem,1.5vw,1.6rem)] pb-[clamp(0.8rem,1.2vw,1rem)] pt-[clamp(1rem,1.4vw,1.25rem)]">
        <div className="flex items-center justify-between gap-[clamp(0.4rem,0.7vw,0.6rem)]">
          <Text variant="caption" tone="muted" className="font-medium">
            {title}
          </Text>
          {Icon && (
            <Icon
              className={cn(
                "h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] shrink-0",
                iconColors[variant]
              )}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="px-[clamp(1.1rem,1.5vw,1.6rem)] pb-[clamp(1.15rem,1.6vw,1.4rem)] pt-0">
        <div className="flex flex-col fluid-stack-xs">
          <Text variant="stat" className="tracking-tight">
            {value}
          </Text>
          {description ? (
            <Text variant="caption" tone="muted">
              {description}
            </Text>
          ) : null}
          {trend ? (
            <Text asChild variant="caption" className="flex items-center gap-[clamp(0.35rem,0.5vw,0.45rem)]">
              <div>
                <span
                  className={cn(
                    "font-medium",
                    trend.isPositive ? "text-emerald-500" : "text-destructive",
                  )}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
                <span className="pl-2 text-muted-foreground">{trend.label}</span>
              </div>
            </Text>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

