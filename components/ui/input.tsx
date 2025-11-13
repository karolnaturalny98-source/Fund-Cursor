import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-[clamp(2.5rem,1.3vw+1.8rem,2.75rem)] w-full rounded-xl border border-input/70 bg-card/72 px-[clamp(0.85rem,1.19vw+0.64rem,1.28rem)] py-[clamp(0.4rem,0.6vw,0.5rem)] fluid-caption font-medium text-foreground transition-all placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "shadow-xs hover:border-input/80 focus-visible:ring-offset-background",
        premium:
          "border-gradient bg-gradient-card text-foreground shadow-premium transition-all hover:border-gradient-premium focus-visible:border-gradient-premium focus-visible:shadow-premium-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
