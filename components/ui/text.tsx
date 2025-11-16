import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      body: "fluid-copy",
      lead: "fluid-lead",
      muted: "fluid-copy",
      caption: "fluid-caption",
      eyebrow: "fluid-eyebrow font-semibold",
      stat: "fluid-h2 font-semibold leading-none tracking-tight",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      accent: "text-[var(--surface-ring)]",
      primary: "text-primary",
    },
    align: {
      start: "text-left",
      center: "text-center",
      justify: "text-justify",
    },
    weight: {
      normal: "",
      medium: "font-medium",
      semibold: "font-semibold",
    },
  },
  compoundVariants: [
    {
      variant: "muted",
      tone: "default",
      className: "text-muted-foreground",
    },
    {
      variant: "eyebrow",
      tone: "default",
      className: "text-muted-foreground",
    },
  ],
  defaultVariants: {
    variant: "body",
    tone: "default",
    align: "start",
    weight: "normal",
  },
});

export interface TextProps
  extends React.ComponentPropsWithoutRef<"p">,
    VariantProps<typeof textVariants> {
  asChild?: boolean;
}

const Text = React.forwardRef<React.ElementRef<"p">, TextProps>(
  ({ asChild = false, className, variant, tone, align, weight, ...props }, ref) => {
    const Comp = asChild ? Slot : "p";

    return (
      <Comp
        ref={ref}
        className={cn(textVariants({ variant, tone, align, weight }), className)}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

export { Text, textVariants };
