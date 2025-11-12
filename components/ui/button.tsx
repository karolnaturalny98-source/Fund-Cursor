import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-background",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-premium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:translate-y-0",
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-premium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:translate-y-0",
        premium:
          "bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--primary)/0.7)_100%)] text-primary-foreground shadow-glass hover:brightness-115 hover:-translate-y-px hover:shadow-[0_0_18px_hsl(var(--primary)/0.25)] active:translate-y-0",
        secondary:
          "border border-border/60 bg-card/60 text-foreground/90 backdrop-blur-xs hover:bg-card/80 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:translate-y-0",
        outline:
          "border border-border/70 bg-transparent text-foreground/90 hover:bg-card/40 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:translate-y-0",
        "outline-solid":
          "border border-border/80 bg-transparent text-foreground hover:bg-card/50 hover:border-border hover:shadow-soft focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:translate-y-0",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-card/30 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/85 focus-visible:ring-2 focus-visible:ring-destructive/80 focus-visible:ring-offset-2 active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline",
        "premium-outline":
          "border-gradient-premium bg-transparent text-primary shadow-glass hover:bg-gradient-button-premium-outline-hover hover:text-primary-foreground hover:-translate-y-px",
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
