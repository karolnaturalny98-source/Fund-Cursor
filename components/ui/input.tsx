import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-11 w-full rounded-xl border border-input/70 bg-[rgba(10,12,15,0.72)] px-4 py-2 text-sm font-medium text-foreground transition-all placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
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
