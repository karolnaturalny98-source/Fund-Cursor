"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const premiumBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "text-foreground",
        gradient:
          "border-transparent bg-linear-to-r from-primary/20 via-primary/15 to-accent/20 text-primary hover:from-primary/30 hover:via-primary/20 hover:to-accent/30",
        glow: "border-transparent bg-primary/15 text-primary glow-premium hover:bg-primary/20",
        shimmer:
          "border-transparent bg-linear-to-r from-primary/20 via-primary/10 to-primary/20 text-primary animate-shimmer bg-size-[200%_100%]",
        "outline-solid":
          "border-border/80 bg-transparent text-foreground/90 hover:border-border hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface PremiumBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof premiumBadgeVariants> {}

export function PremiumBadge({
  className,
  variant,
  ...props
}: PremiumBadgeProps) {
  return (
    <div
      className={cn(premiumBadgeVariants({ variant }), className)}
      {...props}
    />
  );
}

