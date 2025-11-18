"use client";

import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const surfaceVariants = cva(
  "relative rounded-[1.75rem] border border-white/25 bg-black/60 text-white shadow-[0_45px_95px_-55px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-colors duration-200 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-white/5 before:opacity-40",
  {
    variants: {
      variant: {
        default: "border-white/25 bg-black/60",
        muted: "border-white/20 bg-black/50",
        panel: "border-white/18 bg-black/40",
        stats: "border-white/20 bg-black/45",
        glass: "border-white/30 bg-black/35 backdrop-blur",
        ghost: "border-transparent bg-transparent text-white/70 shadow-none",
        outline: "border-white/20 bg-transparent",
        pill:
          "rounded-full border-white/12 bg-black/35 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]",
        "pill-muted":
          "rounded-full border-white/10 bg-black/25 text-white/75 shadow-[0_0_0_1px_rgba(255,255,255,0.025)_inset]",
        elevated: "border-white/35 bg-black/25",
        gradient:
          "border border-white/30 bg-black/20",
        "gradient-outline":
          "border border-white/30 bg-transparent",
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
