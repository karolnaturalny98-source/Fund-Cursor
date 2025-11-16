import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex min-h-[clamp(7rem,8vw+5rem,7.5rem)] w-full rounded-md px-[clamp(0.6rem,0.8vw,0.75rem)] py-[clamp(0.4rem,0.6vw,0.5rem)] fluid-caption transition-all placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-input bg-background shadow-xs focus-visible:ring-offset-background",
        premium:
          "border border-transparent bg-card/90 shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)] transition-all hover:shadow-[0_38px_80px_-40px_rgba(15,23,42,0.5)] focus-visible:ring-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
