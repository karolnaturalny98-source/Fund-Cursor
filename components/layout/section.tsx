import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SectionSize = "sm" | "md" | "lg";
type SectionStack = "none" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const SECTION_PADDING: Record<SectionSize, string> = {
  sm: "fluid-section-sm",
  md: "fluid-section-md",
  lg: "fluid-section-lg",
};

const STACK_GAPS: Record<
  Exclude<SectionStack, "none">,
  | "fluid-stack-2xs"
  | "fluid-stack-xs"
  | "fluid-stack-sm"
  | "fluid-stack-md"
  | "fluid-stack-lg"
  | "fluid-stack-xl"
  | "fluid-stack-2xl"
  | "fluid-stack-3xl"
> = {
  "2xs": "fluid-stack-2xs",
  xs: "fluid-stack-xs",
  sm: "fluid-stack-sm",
  md: "fluid-stack-md",
  lg: "fluid-stack-lg",
  xl: "fluid-stack-xl",
  "2xl": "fluid-stack-2xl",
  "3xl": "fluid-stack-3xl",
};

interface SectionProps extends HTMLAttributes<HTMLElement> {
  size?: SectionSize;
  bleed?: boolean;
  stack?: SectionStack;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ size = "md", bleed = false, stack = "none", className, children, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(
        bleed ? null : "container",
        SECTION_PADDING[size],
        stack !== "none" ? "flex flex-col" : null,
        stack !== "none" ? STACK_GAPS[stack] : null,
        className,
      )}
      {...props}
    >
      {children}
    </section>
  ),
);

Section.displayName = "Section";
