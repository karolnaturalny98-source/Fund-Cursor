import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-semibold transition-all",
  {
    variants: {
      variant: {
        default:
          "fluid-badge border border-border/40 bg-background/60 text-foreground/80 backdrop-blur-[36px]!",
        secondary:
          "fluid-badge border border-border/40 bg-background/60 text-foreground/80 backdrop-blur-[36px]!",
        success: "fluid-badge border border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
        outline: "fluid-badge border border-border/60 bg-transparent text-foreground",
        "outline-solid": "fluid-badge border border-border/80 bg-transparent text-foreground/90",
        pill: "fluid-pill border border-border/60 bg-card/70 text-foreground/90 backdrop-blur",
        "pill-muted":
          "fluid-pill border border-border/50 bg-muted/30 text-muted-foreground backdrop-blur",
        "pill-outline": "fluid-pill border border-border/80 bg-transparent text-foreground/80",
        chip:
          "fluid-pill border border-border/70 bg-background/70 text-foreground/90 shadow-xs transition-colors hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 cursor-pointer",
        "chip-ghost":
          "fluid-pill border border-transparent bg-transparent text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 cursor-pointer",
        eyebrow:
          "fluid-pill border border-border/30 bg-transparent text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground/80",
        hero:
          "fluid-pill border border-white/15 bg-white/5 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/80 backdrop-blur-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

const Badge = React.forwardRef<HTMLElement, BadgeProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
    );
  },
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
