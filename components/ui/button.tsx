import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-background",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-premium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:translate-y-0",
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-premium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:translate-y-0",
        premium:
          "bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--primary)/0.7)_100%)] text-primary-foreground shadow-glass hover:brightness-115 hover:-translate-y-[1px] hover:shadow-[0_0_18px_hsl(var(--primary)_/_0.25)] active:translate-y-0",
        secondary:
          "border border-border/60 bg-[rgba(15,17,20,0.6)] text-foreground/90 backdrop-blur-sm hover:bg-[rgba(15,17,20,0.8)] hover:shadow-soft focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:translate-y-0",
        outline:
          "border border-border/70 bg-transparent text-foreground/90 hover:bg-[rgba(20,22,25,0.4)] hover:shadow-soft focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:translate-y-0",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-[rgba(20,22,25,0.3)] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/85 focus-visible:ring-2 focus-visible:ring-destructive/80 focus-visible:ring-offset-2 active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline",
        "premium-outline":
          "border-gradient-premium bg-transparent text-primary shadow-glass hover:bg-gradient-button-premium-outline-hover hover:text-primary-foreground hover:-translate-y-[1px]",
      },
      size: {
        default: "h-11 px-6 gap-2",
        sm: "h-9 px-4 gap-2 text-xs rounded-xl",
        lg: "h-12 px-7 gap-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref as unknown as React.Ref<HTMLButtonElement>}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
