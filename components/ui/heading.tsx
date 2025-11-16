import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const headingVariants = cva("tracking-tight text-foreground", {
  variants: {
    variant: {
      hero: "fluid-h1 font-bold",
      page: "fluid-h1 font-semibold",
      section: "fluid-h2 font-semibold",
      subsection: "text-lg font-semibold fluid-copy",
      subsectionStrong: "fluid-h3 font-semibold",
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
    },
  },
  defaultVariants: {
    variant: "section",
    tone: "default",
    align: "start",
  },
});

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const LEVEL_TAG: Record<HeadingLevel, keyof JSX.IntrinsicElements> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
};

export interface HeadingProps
  extends React.ComponentPropsWithoutRef<"h2">,
    VariantProps<typeof headingVariants> {
  level?: HeadingLevel;
  asChild?: boolean;
}

const Heading = React.forwardRef<React.ElementRef<"h2">, HeadingProps>(
  ({ level = 2, asChild = false, variant, tone, align, className, ...props }, ref) => {
    const Comp = asChild ? Slot : LEVEL_TAG[level] ?? "h2";

    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ variant, tone, align }), className)}
        {...props}
      />
    );
  },
);
Heading.displayName = "Heading";

export { Heading, headingVariants };
