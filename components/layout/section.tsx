import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SectionSize = "sm" | "md" | "lg";

const SECTION_PADDING: Record<SectionSize, string> = {
  sm: "fluid-section-sm",
  md: "fluid-section-md",
  lg: "fluid-section-lg",
};

interface SectionProps extends HTMLAttributes<HTMLElement> {
  size?: SectionSize;
  bleed?: boolean;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ size = "md", bleed = false, className, children, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(bleed ? null : "container", SECTION_PADDING[size], className)}
      {...props}
    >
      {children}
    </section>
  ),
);

Section.displayName = "Section";

