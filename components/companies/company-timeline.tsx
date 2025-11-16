"use client";

import { useMemo, useRef } from "react";
import { Calendar, Award, TrendingUp, type LucideIcon } from "lucide-react";
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
        "group relative flex flex-col items-center transition-all duration-500 delay-[var(--delay)]",
        "md:shrink-0 md:w-[clamp(16rem,18vw,18rem)]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{
        "--delay": `${index * 100}ms`,
      } as React.CSSProperties}
    >
      {/* Timeline dot with icon */}
      <div className="relative z-10 mb-[clamp(0.9rem,1.2vw,1.1rem)]">
        <div className="flex h-[clamp(2.75rem,3vw,3rem)] w-[clamp(2.75rem,3vw,3rem)] items-center justify-center rounded-full border-2 border-primary/30 bg-background shadow-md ring-2 ring-primary/10 transition-all duration-300 group-hover:border-primary/50 group-hover:ring-primary/20 group-hover:scale-110">
          <Icon className="h-[clamp(1.1rem,0.6vw+0.9rem,1.35rem)] w-[clamp(1.1rem,0.6vw+0.9rem,1.35rem)] text-primary" />
        </div>
      </div>

      {/* Card */}
      <Card className="relative w-full max-w-[clamp(16rem,18vw,18rem)] rounded-2xl border border-border/60 bg-card/72 p-[clamp(1rem,1.4vw,1.25rem)] shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md backdrop-blur-[36px]!">
        <CardContent className="space-y-[clamp(0.75rem,1.1vw,1rem)] p-0">
          {/* Year badge */}
          <div className="flex items-center justify-between gap-[clamp(0.5rem,0.8vw,0.7rem)]">
            <Badge
              variant="outline"
              className="border-border/40 bg-muted/20 font-semibold text-muted-foreground fluid-caption rounded-full"
            >
              {year}
            </Badge>
            {item.type && (
              <PremiumBadge
                variant="outline"
                className={cn("px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] rounded-full font-semibold", typeColor)}
              >
                {typeLabel}
              </PremiumBadge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold leading-tight text-foreground fluid-copy">
            {item.title}
          </h3>

          {/* Date */}
          <p className="font-medium text-muted-foreground fluid-caption">
            {formattedDate}
          </p>

          {/* Description */}
          {item.description && (
            <p className="text-muted-foreground fluid-caption leading-relaxed line-clamp-3">
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
        "relative space-y-[clamp(1.5rem,2.2vw,2rem)] py-[clamp(1.25rem,1.8vw,1.75rem)]",
        sectionAnim.className
      )}
      role="region"
      aria-label="Historia firmy - timeline wydarzeń"
    >
      {/* Timeline items container */}
      <div className="relative flex flex-col gap-[clamp(1.25rem,1.8vw,1.6rem)] md:flex-row md:items-start md:justify-start md:gap-[clamp(1.5rem,2vw,1.9rem)] md:overflow-x-auto md:pb-[clamp(1rem,1.5vw,1.35rem)]">
        {/* Horizontal timeline line - desktop only */}
        <div className="absolute left-0 right-0 top-[clamp(1.4rem,1.8vw,1.7rem)] hidden h-0.5 border-t-2 border-dashed border-border/40 md:block" />

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
