"use client";

import { Award, TrendingUp, Gauge, Receipt, Clock, Zap, Layers, Check } from "lucide-react";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFadeIn } from "@/lib/animations";
import React from "react";

interface ChallengeHighlight {
  id: string;
  label: string;
  value: string;
  description?: string;
  iconName: string;
}

interface ChallengeHighlightCardProps {
  item: ChallengeHighlight;
}

export function ChallengeHighlightCard({ item }: ChallengeHighlightCardProps) {
  const cardAnim = useFadeIn({ rootMargin: "-50px" });
  const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Award,
    TrendingUp,
    Gauge,
    Receipt,
    Clock,
  };
  const Icon = IconMap[item.iconName] || Award;

  return (
    <Card ref={cardAnim.ref} className={cn("group rounded-lg border border-border/40 bg-background/60 backdrop-blur-[36px]! shadow-xs transition-all hover:border-border/60 hover:bg-card/66", cardAnim.className)}>
      <CardContent className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
          <span className="text-[10px] font-medium text-muted-foreground leading-tight">{item.label}</span>
        </div>
        <p className="text-xs font-semibold text-foreground leading-tight">{item.value}</p>
        {item.description ? (
          <p className="text-[10px] leading-relaxed text-muted-foreground">{item.description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface PlanGroup {
  id: string;
  label: string;
  description: string;
  plans: Array<{ id: string; name: string; price: number; currency: string }>;
  iconName: string;
  color: "emerald" | "blue" | "purple";
}

interface ChallengeSegmentCardProps {
  group: PlanGroup;
  onClick?: () => void;
  isActive?: boolean;
}

// Deprecated: Use ChallengeSegmentsAccordion instead
export function ChallengeSegmentCard({ group, onClick, isActive }: ChallengeSegmentCardProps) {
  const cardAnim = useFadeIn({ rootMargin: "-50px" });
  const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Zap,
    TrendingUp,
    Layers,
  };
  const Icon = IconMap[group.iconName] || Zap;

  const colorClasses = {
    emerald: "from-emerald-500/5 via-emerald-500/3 to-transparent border-emerald-500/15 hover:border-emerald-500/30",
    blue: "from-blue-500/5 via-blue-500/3 to-transparent border-blue-500/15 hover:border-blue-500/30",
    purple: "from-purple-500/5 via-purple-500/3 to-transparent border-purple-500/15 hover:border-purple-500/30",
  };

  return (
    <Card
      ref={cardAnim.ref}
      onClick={onClick}
      className={cn(
        "group relative h-full cursor-pointer overflow-hidden rounded-xl border border-border/40 bg-background/60 backdrop-blur-[36px]! p-3 shadow-xs transition-all duration-200",
        "hover:border-primary/30 hover:shadow-xs",
        group.plans.length === 0 && "opacity-50",
        "bg-linear-to-br",
        isActive && "ring-1 ring-primary/30 border-primary/30",
        colorClasses[group.color],
        cardAnim.className,
      )}
    >
      <CardHeader className="space-y-2 p-0">
        <div className="flex items-center gap-2">
          <div className="relative rounded-md bg-primary/5 p-1.5 text-primary transition-all group-hover:bg-primary/10">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <CardTitle className="text-sm font-medium text-foreground">{group.label}</CardTitle>
        </div>
        <CardDescription className="text-xs leading-relaxed text-muted-foreground/80">{group.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-3 space-y-2 p-0">
        {group.plans.length ? (
          <>
            <div className="flex items-center gap-1.5">
              <PremiumBadge variant="outline" className="rounded-full text-[10px] font-normal px-1.5 py-0 border-primary/20">
                {group.plans.length} plan{group.plans.length !== 1 ? "ów" : ""}
              </PremiumBadge>
            </div>
            <ul className="space-y-1.5 text-xs">
              {group.plans.slice(0, 3).map((plan) => (
                <li key={plan.id} className="flex items-start gap-1.5 rounded-md bg-muted/20 px-2 py-1 transition-colors group-hover:bg-muted/30">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary/80" />
                  <span className="leading-relaxed">
                    <span className="font-medium text-foreground/90">{plan.name}</span>
                    <span className="mx-1 text-muted-foreground/60">—</span>
                    <span className="text-muted-foreground/70">
                      {new Intl.NumberFormat("pl-PL", {
                        style: "currency",
                        currency: plan.currency,
                      }).format(plan.price)}
                    </span>
                  </span>
                </li>
              ))}
              {group.plans.length > 3 ? (
                <li className="rounded-md bg-muted/15 px-2 py-1 text-[10px] italic text-muted-foreground/60">
                  … i {group.plans.length - 3} więcej
                </li>
              ) : null}
            </ul>
          </>
        ) : (
          <div className="rounded-md border border-dashed border-border/30 bg-muted/10 px-3 py-4 text-center">
            <p className="text-xs italic text-muted-foreground/60">Brak planów w tym segmencie.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ChallengeSegmentsAccordionProps {
  groups: PlanGroup[];
  selectedSegment: string | null;
  onSegmentClick: (segmentId: string) => void;
}

export function ChallengeSegmentsAccordion({ groups, selectedSegment, onSegmentClick }: ChallengeSegmentsAccordionProps) {
  const sectionAnim = useFadeIn({ rootMargin: "-50px" });
  const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Zap,
    TrendingUp,
    Layers,
  };

  const handleValueChange = (value: string | undefined) => {
    if (value && value !== selectedSegment) {
      onSegmentClick(value);
    } else if (!value && selectedSegment) {
      // Collapsing - clear selection
      onSegmentClick("");
    }
  };

  return (
    <div ref={sectionAnim.ref} className={cn("space-y-2", sectionAnim.className)}>
      <Accordion
        type="single"
        collapsible
        value={selectedSegment || undefined}
        onValueChange={handleValueChange}
        className="w-full"
      >
        {groups.map((group) => {
          const Icon = IconMap[group.iconName] || Zap;
          const isActive = selectedSegment === group.id;
          const hasPlans = group.plans.length > 0;

          return (
            <AccordionItem
              key={group.id}
              value={group.id}
              className={cn(
                "rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! transition-all",
                "hover:border-primary/50 hover:shadow-xs",
                isActive && "border-primary/50 ring-1 ring-primary/20",
                !hasPlans && "opacity-50",
              )}
            >
              <AccordionTrigger
                className={cn(
                  "px-4 py-3 hover:no-underline",
                  "data-[state=open]:border-b data-[state=open]:border-border/40",
                  !hasPlans && "cursor-not-allowed opacity-50",
                )}
                disabled={!hasPlans}
              >
                <div className="flex flex-1 items-center gap-3 text-left">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors",
                    isActive && "bg-primary/20",
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{group.label}</h4>
                      {hasPlans && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal border-border/40 bg-muted/20"
                        >
                          {group.plans.length} plan{group.plans.length !== 1 ? "ów" : ""}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                {hasPlans ? (
                  <div className="space-y-3 pt-2">
                    <ul className="space-y-2">
                      {group.plans.map((plan) => (
                        <li
                          key={plan.id}
                          className="flex items-start gap-2 rounded-lg border border-border/40 bg-background/60 px-3 py-2 transition-colors hover:bg-card/72"
                        >
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/80" />
                          <div className="flex-1 space-y-0.5">
                            <span className="text-sm font-medium text-foreground">{plan.name}</span>
                            <p className="text-xs text-muted-foreground">
                              {new Intl.NumberFormat("pl-PL", {
                                style: "currency",
                                currency: plan.currency,
                              }).format(plan.price)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSegmentClick(group.id);
                        setTimeout(() => {
                          const plansSection = document.getElementById("plany");
                          if (plansSection) {
                            plansSection.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }, 100);
                      }}
                      className={cn(
                        "w-full rounded-lg border border-border/60 bg-card/72 px-3 py-2 text-xs font-medium transition-all",
                        "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
                      )}
                    >
                      Zobacz wszystkie plany w tym segmencie
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/40 bg-muted/10 px-4 py-6 text-center">
                    <p className="text-xs italic text-muted-foreground/60">Brak planów w tym segmencie.</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

