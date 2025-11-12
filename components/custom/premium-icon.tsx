"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const premiumIconVariants = cva(
  "transition-all duration-300",
  {
    variants: {
      variant: {
        default: "text-foreground",
        glow: "text-primary glow-premium",
        gradient: "bg-linear-to-r from-primary to-accent bg-clip-text text-transparent",
        animated: "text-primary animate-pulse-glow",
      },
      size: {
        sm: "h-3 w-3",
        default: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface PremiumIconProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof premiumIconVariants> {
  icon: React.ComponentType<{ className?: string }>;
  hoverGlow?: boolean;
}

export function PremiumIcon({
  icon: Icon,
  variant,
  size,
  className,
  hoverGlow = false,
  ...props
}: PremiumIconProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        hoverGlow && "group cursor-pointer"
      )}
      {...props}
    >
      <Icon
        className={cn(
          premiumIconVariants({ variant, size }),
          hoverGlow && "group-hover:glow-premium group-hover:scale-110"
        )}
      />
    </span>
  );
}

