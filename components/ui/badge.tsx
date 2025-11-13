import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center fluid-badge rounded-full border font-semibold transition-all",
  {
    variants: {
      variant: {
        default: "border-border/40 bg-background/60 backdrop-blur-[36px]! text-foreground/80",
        secondary: "border-border/40 bg-background/60 backdrop-blur-[36px]! text-foreground/80",
        success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
        outline: "border-border/60 text-foreground",
        "outline-solid": "border-border/80 bg-transparent text-foreground/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
