import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeSpacing = "px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)]";
const pillSpacing =
  "gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-semibold transition-all",
  {
    variants: {
      variant: {
        default:
          `${badgeSpacing} border border-border/40 bg-background/60 text-foreground/80 backdrop-blur-[36px]!`,
        secondary:
          `${badgeSpacing} border border-border/40 bg-background/60 text-foreground/80 backdrop-blur-[36px]!`,
        success: `${badgeSpacing} border border-emerald-400/20 bg-emerald-500/10 text-emerald-200`,
        outline: `${badgeSpacing} border border-border/60 bg-transparent text-foreground`,
        "outline-solid": `${badgeSpacing} border border-border/80 bg-transparent text-foreground/90`,
        pill: `${pillSpacing} border border-border/60 bg-card/70 text-foreground/90 backdrop-blur`,
        "pill-muted":
          `${pillSpacing} border border-border/50 bg-muted/30 text-muted-foreground backdrop-blur`,
        "pill-outline": `${pillSpacing} border border-border/80 bg-transparent text-foreground/80`,
        chip:
          `${pillSpacing} border border-border/70 bg-background/70 text-foreground/90 shadow-xs transition-colors hover:border-primary/50 hover:text-primary data-[state=on]:border-primary/50 data-[state=on]:bg-primary/10 data-[state=on]:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 cursor-pointer`,
        "chip-ghost":
          `${pillSpacing} border border-transparent bg-transparent text-muted-foreground hover:text-foreground data-[state=on]:text-foreground data-[state=on]:border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 cursor-pointer`,
        eyebrow:
          `${pillSpacing} border border-border/30 bg-transparent text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground/80`,
        hero:
          `${pillSpacing} border border-white/15 bg-white/5 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/80 backdrop-blur-md`,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type InteractiveVariants = "chip" | "chip-ghost";
const interactiveVariants = new Set<InteractiveVariants>(["chip", "chip-ghost"]);

export interface BadgeProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  pressed?: boolean;
}

const Badge = React.forwardRef<HTMLElement, BadgeProps>(
  ({ className, variant, asChild = false, pressed = false, type, ...props }, ref) => {
    const isInteractive =
      typeof variant !== "undefined" && interactiveVariants.has(variant as InteractiveVariants);
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
        className={cn(badgeVariants({ variant }), className)}
        {...componentProps}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
