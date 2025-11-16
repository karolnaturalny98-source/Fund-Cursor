"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const premiumBadgeVariants = cva(
  "inline-flex items-center rounded-full border text-xs font-semibold transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "px-2.5 py-0.5 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "px-2.5 py-0.5 text-foreground",
        gradient:
          "px-3 py-1 border-transparent bg-linear-to-r from-primary/20 via-primary/15 to-accent/20 text-primary hover:from-primary/30 hover:via-primary/20 hover:to-accent/30",
        glow: "px-3 py-1 border-transparent bg-primary/15 text-primary glow-premium hover:bg-primary/20",
        shimmer:
          "px-3 py-1 border-transparent bg-linear-to-r from-primary/20 via-primary/10 to-primary/20 text-primary animate-shimmer bg-size-[200%_100%]",
        "outline-solid":
          "px-2.5 py-0.5 border-border/80 bg-transparent text-foreground/90 hover:border-border hover:text-foreground",
        pill:
          "fluid-pill border border-primary/30 bg-primary/5 text-primary hover:border-primary/40 hover:bg-primary/10",
        chip:
          "fluid-pill border border-primary/30 bg-transparent text-primary transition-colors hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/40 cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface PremiumBadgeProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof premiumBadgeVariants> {
  asChild?: boolean;
}

const PremiumBadge = React.forwardRef<HTMLElement, PremiumBadgeProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp ref={ref} className={cn(premiumBadgeVariants({ variant }), className)} {...props} />
    );
  },
);
PremiumBadge.displayName = "PremiumBadge";

export { PremiumBadge, premiumBadgeVariants };
