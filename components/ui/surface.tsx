"use client";

import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const surfaceVariants = cva(
  "relative rounded-2xl border border-border/60 bg-card/72 text-foreground shadow-xs transition-colors duration-300",
  {
    variants: {
      variant: {
        default: "bg-card/72 text-foreground backdrop-blur-[28px]!",
        muted: "bg-muted/40 text-foreground/90 backdrop-blur",
        panel:
          "border-border/50 bg-[var(--surface-base)]/90 text-foreground shadow-[0_28px_60px_-40px_rgba(15,23,42,0.32),0_12px_32px_-32px_rgba(15,23,42,0.24)] backdrop-blur",
        stats:
          "border-border/40 bg-[var(--surface-highlight)]/18 text-foreground shadow-[0_28px_60px_-40px_rgba(15,23,42,0.32),0_12px_32px_-32px_rgba(15,23,42,0.24)] backdrop-blur",
        glass:
          "border-white/15 bg-white/5 text-white/90 shadow-[0_35px_120px_-45px_rgba(255,255,255,0.85)] backdrop-blur-[42px]",
        ghost: "border-transparent bg-transparent shadow-none",
        outline: "border-dashed border-border/50 bg-transparent",
        pill:
          "rounded-full border-border/60 bg-card/70 text-foreground shadow-[0_8px_30px_-20px_rgba(15,23,42,0.45)]",
        "pill-muted":
          "rounded-full border-border/50 bg-muted/40 text-muted-foreground shadow-[0_8px_30px_-20px_rgba(15,23,42,0.3)]",
        elevated:
          "bg-background/80 text-foreground shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)] backdrop-blur",
        gradient:
          "border-transparent bg-gradient-card text-foreground shadow-[0_32px_70px_-38px_rgba(15,23,42,0.4)] backdrop-blur",
        "gradient-outline":
          "border-gradient bg-gradient-card text-foreground shadow-[0_32px_70px_-38px_rgba(15,23,42,0.4)] backdrop-blur",
      },
      padding: {
        none: "p-0",
        xs: "p-2",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
        pill: "px-5 py-2.5",
      },
    },
    compoundVariants: [
      {
        variant: "pill",
        padding: "md",
        class: "px-6 py-3",
      },
      {
        variant: "pill-muted",
        padding: "md",
        class: "px-6 py-3",
      },
    ],
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  },
);

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof surfaceVariants> {
  asChild?: boolean;
}

const Surface = React.forwardRef<HTMLElement, SurfaceProps>(
  ({ className, variant, padding, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp ref={ref} className={cn(surfaceVariants({ variant, padding }), className)} {...props} />
    );
  },
);
Surface.displayName = "Surface";

export { Surface, surfaceVariants };
