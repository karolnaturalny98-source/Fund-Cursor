import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeaderAlign = "start" | "center";
type SectionHeaderSize = "md" | "lg";
type EyebrowTone = "muted" | "accent" | "primary";

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: SectionHeaderAlign;
  size?: SectionHeaderSize;
  eyebrowTone?: EyebrowTone;
}

const ALIGN_CLASSES: Record<SectionHeaderAlign, string> = {
  start: "text-left items-start",
  center: "text-center items-center",
};

const SIZE_CLASSES: Record<SectionHeaderSize, string> = {
  md: "fluid-stack-2xs",
  lg: "fluid-stack-sm",
};

const EYEBROW_TONE_CLASSES: Record<EyebrowTone, string> = {
  muted: "text-muted-foreground",
  accent: "text-[var(--surface-ring)]",
  primary: "text-primary",
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  size = "lg",
  eyebrowTone = "muted",
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn("flex flex-col", ALIGN_CLASSES[align], SIZE_CLASSES[size], className)}
      {...props}
    >
      {eyebrow ? (
        <div className={cn("font-semibold tracking-[0.35em] fluid-caption uppercase", EYEBROW_TONE_CLASSES[eyebrowTone])}>
          {eyebrow}
        </div>
      ) : null}
      <h2 className="fluid-h2 font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-muted-foreground fluid-copy">{description}</p>
      ) : null}
    </div>
  );
}
