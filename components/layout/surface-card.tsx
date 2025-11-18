import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SurfaceVariant = "base" | "muted" | "panel" | "stats" | "elevated" | "glass" | "outline" | "pill";
type SurfacePadding = "none" | "sm" | "md" | "lg" | "xl";

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  padding?: SurfacePadding;
}

const VARIANT_CLASSES: Record<SurfaceVariant, string> = {
  base: "border-white/25 bg-black/65",
  muted: "border-white/20 bg-black/55",
  panel: "border-white/15 bg-black/45",
  stats: "border-white/20 bg-black/50",
  elevated: "border-white/30 bg-black/35",
  glass: "border-white/35 bg-black/30 backdrop-blur-sm",
  outline: "border-white/30 bg-transparent",
  pill: "rounded-full border-white/25 bg-black/60",
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
        "relative rounded-[1.8rem] border border-white/25 text-white shadow-[0_45px_95px_-55px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-colors duration-200 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-white/5 before:opacity-50",
        VARIANT_CLASSES[variant],
        PADDING_CLASSES[padding],
        className,
      )}
      {...props}
    />
  );
}
