"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
}

export function SectionCard({
  title,
  description,
  children,
  className,
  headerActions,
  footer,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <CardHeader className="px-[clamp(1.1rem,1.5vw,1.6rem)] py-[clamp(1.15rem,1.7vw,1.4rem)]">
        <div className="flex flex-col gap-[clamp(0.65rem,0.95vw,0.8rem)] sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col fluid-stack-xs">
            <CardTitle className="text-[clamp(1.15rem,0.55vw+1.05rem,1.35rem)] font-semibold tracking-tight">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="fluid-copy text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.6rem)]">
              {headerActions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col fluid-stack-md px-[clamp(1.1rem,1.5vw,1.6rem)] pb-[clamp(1.2rem,1.8vw,1.45rem)] pt-0">
        {children}
      </CardContent>
      {footer && (
        <div className="border-t border-border/50 px-[clamp(1.1rem,1.5vw,1.6rem)] pb-[clamp(1.2rem,1.7vw,1.45rem)] pt-0">
          {footer}
        </div>
      )}
    </Card>
  );
}


