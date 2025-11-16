"use client";

import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeSpacing = "px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)]";
const pillSpacing =
  "gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full";

const premiumBadgeVariants = cva(
  "inline-flex items-center rounded-full border text-xs font-semibold transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          `${badgeSpacing} border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80`,
        outline: `${badgeSpacing} text-foreground`,
        gradient:
          `${badgeSpacing} border-transparent bg-linear-to-r from-primary/20 via-primary/15 to-accent/20 text-primary hover:from-primary/30 hover:via-primary/20 hover:to-accent/30`,
        glow: `${badgeSpacing} border-transparent bg-primary/15 text-primary glow-premium hover:bg-primary/20`,
        shimmer:
          `${badgeSpacing} border-transparent bg-linear-to-r from-primary/20 via-primary/10 to-primary/20 text-primary animate-shimmer bg-size-[200%_100%]`,
        "outline-solid":
          `${badgeSpacing} border-border/80 bg-transparent text-foreground/90 hover:border-border hover:text-foreground`,
        pill:
          `${pillSpacing} border border-primary/30 bg-primary/5 text-primary hover:border-primary/40 hover:bg-primary/10`,
        chip:
          `${pillSpacing} border border-primary/30 bg-transparent text-primary transition-colors hover:bg-primary/10 hover:text-primary data-[state=on]:border-primary/50 data-[state=on]:bg-primary/10 data-[state=on]:text-primary focus-visible:ring-primary/40 cursor-pointer`,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type InteractiveVariant = "chip";
const interactiveVariants = new Set<InteractiveVariant>(["chip"]);

export interface PremiumBadgeProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof premiumBadgeVariants> {
  asChild?: boolean;
  pressed?: boolean;
}

const PremiumBadge = React.forwardRef<HTMLElement, PremiumBadgeProps>(
  ({ className, variant, asChild = false, pressed = false, type, ...props }, ref) => {
    const isInteractive = Boolean(variant && interactiveVariants.has(variant as InteractiveVariant));
    const Comp = asChild ? Slot : isInteractive ? "button" : "span";
    const componentProps =
      !asChild && isInteractive
        ? ({
            type: type ?? "button",
            "aria-pressed": pressed,
          } satisfies React.ButtonHTMLAttributes<HTMLButtonElement>)
        : undefined;

    return (
      <Comp
        ref={ref}
        data-state={isInteractive ? (pressed ? "on" : "off") : undefined}
        className={cn(premiumBadgeVariants({ variant }), className)}
        {...componentProps}
        {...props}
      />
    );
  },
);
PremiumBadge.displayName = "PremiumBadge";

export { PremiumBadge, premiumBadgeVariants };
