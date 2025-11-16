import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva("text-card-foreground transition-shadow duration-300", {
  variants: {
    variant: {
      default: "glass-card card-outline",
      muted:
        "rounded-[calc(var(--radius)*3)] border border-border/60 bg-card/80 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.32),0_12px_32px_-32px_rgba(15,23,42,0.24)]",
      elevated:
        "rounded-[calc(var(--radius)*3)] border border-border/50 bg-background/85 shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)] backdrop-blur",
      stats:
        "rounded-[calc(var(--radius)*3)] border border-border/45 bg-[var(--surface-base)]/90 text-foreground shadow-[0_28px_60px_-40px_rgba(15,23,42,0.32),0_12px_32px_-32px_rgba(15,23,42,0.24)]",
      outline: "rounded-[calc(var(--radius)*3)] border border-border/50 bg-transparent shadow-none",
      ghost: "rounded-[calc(var(--radius)*3)] border border-transparent bg-transparent shadow-none",
      gradient:
        "rounded-[calc(var(--radius)*3)] border border-transparent bg-gradient-card text-foreground shadow-[0_32px_70px_-38px_rgba(15,23,42,0.4)] backdrop-blur",
      "gradient-outline":
        "rounded-[calc(var(--radius)*3)] border border-gradient bg-gradient-card text-foreground shadow-[0_32px_70px_-38px_rgba(15,23,42,0.4)] backdrop-blur",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "none",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, padding }), className)} {...props} />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1 p-6 pb-3", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
