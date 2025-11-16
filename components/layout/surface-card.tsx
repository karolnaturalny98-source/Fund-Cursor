import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SurfaceVariant = "base" | "muted" | "panel" | "stats" | "elevated" | "glass" | "outline" | "pill";
type SurfacePadding = "none" | "sm" | "md" | "lg" | "xl";

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  padding?: SurfacePadding;
}

const VARIANT_CLASSES: Record<SurfaceVariant, string> = {
  base:
    "border border-border/60 bg-[var(--surface-base)] shadow-[0_28px_60px_-40px_rgba(15,23,42,0.32),0_12px_32px_-32px_rgba(15,23,42,0.24)]",
  muted:
    "border border-border/50 bg-[var(--surface-muted)] shadow-[0_28px_60px_-40px_rgba(15,23,42,0.32),0_12px_32px_-32px_rgba(15,23,42,0.24)]",
  panel:
    "border border-border/45 bg-background/85 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.32),0_12px_32px_-32px_rgba(15,23,42,0.24)] backdrop-blur",
  stats:
    "border border-border/40 bg-[var(--surface-highlight)]/18 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.32),0_12px_32px_-32px_rgba(15,23,42,0.24)] backdrop-blur",
  elevated:
    "border border-border/40 bg-[var(--surface-elevated)] shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]",
  glass:
    "border border-border/30 bg-[var(--surface-glass)]/80 shadow-[0_32px_70px_-38px_rgba(0,0,0,0.45)] backdrop-blur-[28px]",
  outline: "border border-border/45 bg-transparent",
  pill:
    "rounded-full border border-border/60 bg-[var(--surface-base)]/95 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)]",
};

const PADDING_CLASSES: Record<SurfacePadding, string> = {
  none: "",
  sm: "surface-pad-sm",
  md: "surface-pad-md",
  lg: "surface-pad-lg",
  xl: "surface-pad-lg xl:px-10 xl:py-8",
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
