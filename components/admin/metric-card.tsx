"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

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
        "rounded-xl border !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] transition-all duration-200 hover:shadow-md",
        variantStyles[variant],
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <Icon className={cn("h-4 w-4 shrink-0", iconColors[variant])} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <span
                className={cn(
                  "font-medium",
                  trend.isPositive
                    ? "text-emerald-500"
                    : "text-destructive"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

