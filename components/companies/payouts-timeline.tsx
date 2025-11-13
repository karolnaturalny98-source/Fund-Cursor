"use client";

import { useMemo, useState } from "react";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFadeIn } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { CompanyWithDetails } from "@/lib/types";

interface PayoutsTimelineProps {
  company: CompanyWithDetails;
}

interface TimelineEvent {
  days: number;
  date: Date;
  plans: Array<{ name: string; id: string }>;
  type: "first" | "cycle";
}

export function PayoutsTimeline({ company }: PayoutsTimelineProps) {
  const sectionAnim = useFadeIn({ rootMargin: "-50px" });
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Generate timeline events
  const timelineEvents = useMemo(() => {
    const eventMap = new Map<number, TimelineEvent>();

    company.plans.forEach((plan) => {
      // First payout
      if (plan.payoutFirstAfterDays) {
        const days = plan.payoutFirstAfterDays;
        if (!eventMap.has(days)) {
          const date = new Date(today);
          date.setDate(date.getDate() + days);
          eventMap.set(days, {
            days,
            date,
            plans: [],
            type: "first",
          });
        }
        eventMap.get(days)!.plans.push({ name: plan.name, id: plan.id });
      }

      // Cycle payout (if different from first)
      if (plan.payoutCycleDays && plan.payoutCycleDays !== plan.payoutFirstAfterDays) {
        const days = plan.payoutFirstAfterDays
          ? plan.payoutFirstAfterDays + plan.payoutCycleDays
          : plan.payoutCycleDays;
        const key = days * 1000 + 1; // Add offset to distinguish from first
        if (!eventMap.has(key)) {
          const date = new Date(today);
          date.setDate(date.getDate() + days);
          eventMap.set(key, {
            days,
            date,
            plans: [],
            type: "cycle",
          });
        }
        eventMap.get(key)!.plans.push({ name: plan.name, id: plan.id });
      }
    });

    return Array.from(eventMap.values())
      .filter((event) => !selectedPlanId || event.plans.some((p) => p.id === selectedPlanId))
      .sort((a, b) => a.days - b.days)
      .slice(0, 12); // Limit to 12 events
  }, [company.plans, selectedPlanId, today]);

  if (timelineEvents.length === 0) {
    return null;
  }

  return (
    <div ref={sectionAnim.ref} className={cn("space-y-4", sectionAnim.className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold sm:text-xl">Timeline wypłat</h2>
          <p className="text-xs text-muted-foreground">
            Wizualizacja kiedy można oczekiwać wypłat dla wybranych planów.
          </p>
        </div>
        <Select value={selectedPlanId ?? "all"} onValueChange={(value) => setSelectedPlanId(value === "all" ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Wszystkie plany" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie plany</SelectItem>
            {company.plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
        <CardContent className="p-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border/40" />

            {/* Timeline events */}
            <div className="relative space-y-6">
              {/* Today marker */}
              <div className="relative flex items-center gap-4">
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background shadow-xs">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-medium bg-primary/10 text-primary border-primary/30">
                      Dzisiaj
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {today.toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Future events */}
              {timelineEvents.map((event, index) => {
                const isPast = event.date < today;
                const isToday = event.date.toDateString() === today.toDateString();

                return (
                  <div key={`${event.days}-${index}`} className="relative flex items-start gap-4">
                    <div
                      className={cn(
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 shadow-xs transition-all",
                        isPast
                          ? "border-muted-foreground/30 bg-muted/30"
                          : isToday
                            ? "border-primary bg-primary/10"
                            : "border-primary/50 bg-background"
                      )}
                    >
                      {event.type === "first" ? (
                        <TrendingUp className={cn("h-4 w-4", isPast ? "text-muted-foreground" : "text-primary")} />
                      ) : (
                        <Calendar className={cn("h-4 w-4", isPast ? "text-muted-foreground" : "text-primary")} />
                      )}
                    </div>
                    <div className="flex-1 space-y-2 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium",
                            isPast
                              ? "bg-muted/20 text-muted-foreground border-border/40"
                              : "bg-primary/10 text-primary border-primary/30"
                          )}
                        >
                          {event.days} {event.days === 1 ? "dzień" : "dni"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {event.date.toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {event.type === "first" && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                            Pierwsza wypłata
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-foreground">
                          {event.plans.length} {event.plans.length === 1 ? "plan" : "planów"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {event.plans.slice(0, 3).map((plan) => (
                            <Badge
                              key={plan.id}
                              variant="outline"
                              className="text-[10px] font-normal bg-muted/30 text-muted-foreground border-border/40"
                            >
                              {plan.name}
                            </Badge>
                          ))}
                          {event.plans.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-normal bg-muted/30 text-muted-foreground border-border/40"
                            >
                              +{event.plans.length - 3} więcej
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

