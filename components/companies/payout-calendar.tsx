"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Company } from "@/lib/types";

interface PayoutCalendarProps {
  company: Company;
}

export function PayoutCalendar({ company }: PayoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const daysOfWeek = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const monthNames = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ];
  
  // Calculate payout dates based on company plans
  const payoutDates = new Set<number>();
  (company.plans ?? []).forEach((plan) => {
    if (plan.payoutFirstAfterDays) {
      const today = new Date();
      const firstPayoutDate = new Date(today);
      firstPayoutDate.setDate(today.getDate() + plan.payoutFirstAfterDays);
      
      if (firstPayoutDate.getMonth() === currentMonth && firstPayoutDate.getFullYear() === currentYear) {
        payoutDates.add(firstPayoutDate.getDate());
      }
    }
  });
  
  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };
  
  const isPayoutDate = (day: number) => payoutDates.has(day);
  
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < (firstDayWeekday === 0 ? 6 : firstDayWeekday - 1); i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  
  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
            className="h-8 w-8 rounded-lg border-border/40 hover:border-gradient-premium hover:bg-gradient-card"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8 rounded-lg border-border/40 hover:border-gradient-premium hover:bg-gradient-card"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="flex items-center justify-center p-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="aspect-square" />;
            }
            
            return (
              <div
                key={index}
                className={cn(
                  "group relative flex aspect-square cursor-pointer items-center justify-center rounded-lg border transition-all",
                  "hover:border-gradient-premium hover:shadow-premium",
                  isToday(day) && "border-primary bg-primary/10 ring-2 ring-primary/20",
                  isPayoutDate(day) && !isToday(day) && "border-emerald-500/30 bg-emerald-500/10",
                  !isToday(day) && !isPayoutDate(day) && "border-border/40 hover:bg-muted/30"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    isToday(day) && "text-primary font-semibold",
                    isPayoutDate(day) && !isToday(day) && "text-emerald-400 font-semibold",
                    !isToday(day) && !isPayoutDate(day) && "text-foreground"
                  )}
                >
                  {day}
                </span>
                {isPayoutDate(day) && (
                  <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border border-primary bg-primary/10 ring-2 ring-primary/20" />
          <span>Dzisiaj</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border border-emerald-500/30 bg-emerald-500/10" />
          <span>Dzień wypłaty</span>
        </div>
      </div>
    </div>
  );
}
