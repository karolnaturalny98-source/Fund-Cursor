import type { HTMLAttributes, ReactNode } from "react";

import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
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

const EYEBROW_TONE_TO_TEXT: Record<EyebrowTone, "default" | "muted" | "accent" | "primary"> = {
  muted: "muted",
  accent: "accent",
  primary: "primary",
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
        <Text variant="eyebrow" tone={EYEBROW_TONE_TO_TEXT[eyebrowTone]}>
          {eyebrow}
        </Text>
      ) : null}
      <Heading
        level={2}
        variant={size === "lg" ? "section" : "subsection"}
        align={align}
      >
        {title}
      </Heading>
      {description ? (
        <Text variant="body" tone="muted" align={align} className="max-w-2xl">
          {description}
        </Text>
      ) : null}
    </div>
  );
}
