import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const baseGradient =
  "relative appearance-none cursor-pointer transition-[transform,shadow] focus-visible:outline-hidden focus-visible:ring-white/80 focus-visible:ring-2 focus-visible:ring-offset-2";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-background",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_20px_35px_-25px_rgba(15,23,42,0.4)] hover:bg-primary/90 hover:shadow-[0_30px_55px_-30px_rgba(15,23,42,0.45)] active:translate-y-0",
        default:
          "bg-primary text-primary-foreground shadow-[0_20px_35px_-25px_rgba(15,23,42,0.4)] hover:bg-primary/90 hover:shadow-[0_30px_55px_-30px_rgba(15,23,42,0.45)] active:translate-y-0",
        premium:
          "bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--primary)/0.7)_100%)] text-primary-foreground shadow-[0_25px_55px_-30px_hsl(var(--primary)/0.55)] hover:brightness-115 hover:-translate-y-px hover:shadow-[0_35px_70px_-35px_hsl(var(--primary)/0.6)] active:translate-y-0",
        secondary:
          "border border-border/60 bg-card/60 text-foreground/90 backdrop-blur-xs hover:bg-card/80 hover:shadow-[0_20px_35px_-25px_rgba(15,23,42,0.3)] active:translate-y-0",
        outline:
          "border border-border/70 bg-transparent text-foreground/90 hover:bg-card/40 hover:shadow-[0_18px_30px_-20px_rgba(15,23,42,0.25)] active:translate-y-0",
        "outline-solid":
          "border border-border/80 bg-transparent text-foreground hover:bg-card/50 hover:border-border hover:shadow-[0_18px_30px_-20px_rgba(15,23,42,0.25)] active:translate-y-0",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-card/30 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_20px_35px_-25px_rgba(255,82,82,0.5)] hover:bg-destructive/85 active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline",
        "premium-outline":
          "border-gradient-premium bg-transparent text-primary shadow-glass hover:bg-gradient-button-premium-outline-hover hover:text-primary-foreground hover:-translate-y-px",
        glow:
          "bg-white text-secondary-foreground border border-white/30 shadow-[0_30px_60px_-30px_rgba(255,255,255,0.95)] hover:-translate-y-0.5 hover:shadow-[0_45px_80px_-35px_rgba(255,255,255,0.95)] focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2",
        "ghost-dark":
          "bg-[rgba(5,5,5,0.75)] text-foreground border border-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] hover:bg-[rgba(10,10,10,0.85)] hover:border-white/25 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
        "cta-gradient":
          `${baseGradient} h-auto min-h-0 rounded-[1.35rem] px-8 py-3 font-semibold text-white shadow-[0_25px_55px_-30px_hsl(var(--accent)/0.95)] bg-[radial-gradient(var(--spread-x,100%)_var(--spread-y,100%)_at_var(--pos-x,0%)_var(--pos-y,100%),#f77bb6_var(--stop-1,0%),#ed6c79_var(--stop-2,13.38%),#f7832f_var(--stop-3,26.45%),#390e0c_var(--stop-4,72.25%),#050505_var(--stop-5,100%))]`,
        "cta-gradient-variant":
          `${baseGradient} h-auto min-h-0 rounded-[1.35rem] px-8 py-3 font-semibold text-white shadow-[0_25px_55px_-30px_rgba(3,169,244,0.6)] bg-[radial-gradient(var(--spread-x,100%)_var(--spread-y,100%)_at_var(--pos-x,0%)_var(--pos-y,100%),#0b0f26_var(--stop-1,0%),#152554_var(--stop-2,40%),#1f4aa8_var(--stop-3,70%),#24d6ff_var(--stop-4,100%))]`,
        nav:
          "h-auto min-h-0 rounded-full border border-white/20 bg-white/5 px-6 py-2 text-sm font-semibold text-white/80 shadow-[0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-colors hover:text-white hover:bg-white/10 focus-visible:ring-white/30 focus-visible:ring-2 focus-visible:ring-offset-2",
        "nav-ghost":
          "h-auto min-h-0 rounded-full px-4 py-2 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 focus-visible:ring-white/30 focus-visible:ring-2 focus-visible:ring-offset-2",
      },
      size: {
        default: "fluid-button",
        sm: "fluid-button-sm",
        lg: "fluid-button-lg",
        icon: "fluid-button-icon",
        link: "fluid-copy fluid-stack-2xs h-auto min-h-0 p-0",
        none: "h-auto min-h-0 rounded-none p-0",
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
    const resolvedSize =
      size ??
      (variant === "link"
        ? "link"
        : variant && ["cta-gradient", "nav", "nav-ghost"].includes(variant)
          ? "none"
          : undefined);

    return (
      <Comp
        ref={ref as unknown as React.Ref<HTMLButtonElement>}
        className={cn(buttonVariants({ variant, size: resolvedSize }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
