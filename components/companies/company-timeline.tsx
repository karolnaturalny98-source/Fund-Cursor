"use client";

import { useMemo, useRef } from "react";
import { Calendar, Award, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PremiumBadge } from "@/components/custom/premium-badge";
import type { CompanyTimeline } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useFadeIn, useScrollAnimation, useStaggerAnimation } from "@/lib/animations";

interface CompanyTimelineProps {
  timelineItems: CompanyTimeline[];
}

const TYPE_COLORS: Record<string, string> = {
  milestone: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  achievement: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  update: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  award: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const TYPE_LABELS: Record<string, string> = {
  milestone: "Kamień milowy",
  achievement: "Osiągnięcie",
  update: "Aktualizacja",
  award: "Nagroda",
};

const DEFAULT_ICONS: Record<string, LucideIcon> = {
  milestone: Calendar,
  achievement: Award,
  update: TrendingUp,
  award: Award,
};

interface TimelineItemProps {
  item: CompanyTimeline;
  index: number;
  isVisible: boolean;
  isLast: boolean;
}

function TimelineItem({ item, index, isVisible, isLast: _isLast }: TimelineItemProps) {
  const date = new Date(item.date);
  const formattedDate = date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const year = date.getFullYear();

  const type = item.type ?? "milestone";
  const Icon = DEFAULT_ICONS[type] ?? Calendar;
  const typeColor = TYPE_COLORS[type] ?? TYPE_COLORS.milestone;
  const typeLabel = TYPE_LABELS[type] ?? "Wydarzenie";

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center transition-all duration-500",
        "md:flex-shrink-0 md:w-[280px]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Timeline dot with icon */}
      <div className="relative z-10 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/30 bg-background shadow-md ring-2 ring-primary/10 transition-all duration-300 group-hover:border-primary/50 group-hover:ring-primary/20 group-hover:scale-110">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Card */}
      <Card className="relative w-full max-w-[280px] rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] p-4 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md">
        <CardContent className="space-y-3 p-0">
          {/* Year badge */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="text-xs font-semibold text-muted-foreground border-border/40 bg-muted/20"
            >
              {year}
            </Badge>
            {item.type && (
              <PremiumBadge
                variant="outline"
                className={cn("text-[10px] font-semibold px-2 py-0.5", typeColor)}
              >
                {typeLabel}
              </PremiumBadge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {item.title}
          </h3>

          {/* Date */}
          <p className="text-xs font-medium text-muted-foreground">
            {formattedDate}
          </p>

          {/* Description */}
          {item.description && (
            <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
              {item.description}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function CompanyTimeline({ timelineItems }: CompanyTimelineProps) {
  const sectionAnim = useFadeIn({ threshold: 0.1 });
  const sectionScrollAnim = useScrollAnimation({ threshold: 0.1 });
  const containerRef = useRef<HTMLDivElement>(null);

  const sortedItems = useMemo(() => {
    return [...timelineItems].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateB - dateA; // Najnowsze pierwsze
      return a.order - b.order;
    });
  }, [timelineItems]);

  const totalItems = sortedItems.length;
  const staggerItems = useStaggerAnimation(totalItems, 80);
  const visibleStaggerItems = sectionScrollAnim.isVisible ? staggerItems : new Array(totalItems).fill(true);

  if (sortedItems.length === 0) {
    return null;
  }

  return (
    <div
      ref={(node) => {
        sectionAnim.ref.current = node;
        sectionScrollAnim.ref.current = node;
        containerRef.current = node;
      }}
      className={cn(
        "relative space-y-8 py-4",
        sectionAnim.className
      )}
      role="region"
      aria-label="Historia firmy - timeline wydarzeń"
    >
      {/* Timeline items container */}
      <div className="relative flex flex-col gap-8 md:flex-row md:items-start md:justify-start md:gap-8 md:overflow-x-auto md:pb-4">
        {/* Horizontal timeline line - desktop only */}
        <div className="absolute left-0 right-0 top-6 hidden h-0.5 border-t-2 border-dashed border-border/40 md:block" />

        {sortedItems.map((item, index) => {
          const isVisible = visibleStaggerItems[index] || false;
          const isLast = index === sortedItems.length - 1;

          return (
            <TimelineItem
              key={item.id}
              item={item}
              index={index}
              isVisible={isVisible}
              isLast={isLast}
            />
          );
        })}
      </div>
    </div>
  );
}
