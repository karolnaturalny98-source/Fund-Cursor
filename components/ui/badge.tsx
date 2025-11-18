import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeSpacing = "px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)]";
const pillSpacing =
  "gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-semibold text-white/85 transition-all",
  {
    variants: {
      variant: {
        default: `${badgeSpacing} border border-white/10 bg-white/5 backdrop-blur-md`,
        secondary: `${badgeSpacing} border border-white/10 bg-white/[0.04] text-white/75`,
        success: `${badgeSpacing} border border-emerald-500/25 bg-emerald-500/10 text-emerald-200`,
        outline: `${badgeSpacing} border border-white/20 bg-transparent text-white`,
        "outline-solid": `${badgeSpacing} border border-white/25 bg-transparent text-white`,
        pill: `${pillSpacing} border border-white/12 bg-white/[0.03] text-white/85`,
        "pill-muted": `${pillSpacing} border border-white/10 bg-white/[0.02] text-white/70`,
        "pill-outline": `${pillSpacing} border border-white/20 bg-transparent text-white/80`,
        chip:
          `${pillSpacing} border border-white/10 bg-white/[0.02] text-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] transition-colors hover:border-white/25 hover:text-white data-[state=on]:border-white/30 data-[state=on]:bg-white/[0.08] data-[state=on]:text-white focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 cursor-pointer`,
        "chip-ghost":
          `${pillSpacing} border border-transparent bg-transparent text-white/60 hover:text-white data-[state=on]:text-white data-[state=on]:border-white/20 focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 cursor-pointer`,
        eyebrow:
          `${pillSpacing} border border-white/20 bg-transparent text-[0.7rem] uppercase tracking-[0.3em] text-white/70`,
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
