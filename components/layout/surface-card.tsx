import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SurfaceVariant = "base" | "muted" | "elevated" | "glass" | "outline";
type SurfacePadding = "none" | "sm" | "md" | "lg";

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  padding?: SurfacePadding;
}

const VARIANT_CLASSES: Record<SurfaceVariant, string> = {
  base: "border border-border/60 bg-[var(--surface-base)] shadow-soft",
  muted: "border border-border/50 bg-[var(--surface-muted)] shadow-soft",
  elevated: "border border-border/40 bg-[var(--surface-elevated)] shadow-premium",
  glass:
    "border border-border/30 bg-[var(--surface-glass)]/80 shadow-[0_32px_70px_-38px_rgba(0,0,0,0.45)] backdrop-blur-[28px]",
  outline: "border border-border/45 bg-transparent",
};

const PADDING_CLASSES: Record<SurfacePadding, string> = {
  none: "",
  sm: "surface-pad-sm",
  md: "surface-pad-md",
  lg: "surface-pad-lg",
};

export function SurfaceCard({
  className,
  variant = "muted",
  padding = "md",
  ...props
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "rounded-[calc(var(--radius)*3)] transition-shadow duration-200",
        VARIANT_CLASSES[variant],
        PADDING_CLASSES[padding],
        className,
      )}
      {...props}
    />
  );
}
