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
    <Card className={cn("rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm">{description}</CardDescription>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
      {footer && (
        <div className="border-t border-border/50 p-4 pt-0">
          {footer}
        </div>
      )}
    </Card>
  );
}

