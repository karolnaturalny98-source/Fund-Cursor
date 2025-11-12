"use client";

import { Award, Star, Layers, MessageSquare, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFadeIn } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/app/providers/currency-client-provider";
import { convertCurrency } from "@/lib/currency";
import { useMemo } from "react";

type CompanyWithDetails = NonNullable<Awaited<ReturnType<typeof import("@/lib/queries/companies").getCompanyBySlug>>>;

interface OverviewQuickStatsProps {
  company: CompanyWithDetails;
}

export function OverviewQuickStats({ company }: OverviewQuickStatsProps) {
  const sectionAnim = useFadeIn({ rootMargin: "-50px" });
  const { rates } = useCurrency();

  const cashbackRange = useMemo(() => {
    const rate = company.cashbackRate;
    if (rate == null || rate <= 0 || !company.plans.length) {
      return null;
    }

    const cashbackValues = company.plans
      .map((plan) => {
        const priceInUsd = convertCurrency(plan.price, plan.currency, "USD", rates);
        return (priceInUsd * rate) / 100;
      })
      .filter((val) => Number.isFinite(val) && val > 0);

    if (cashbackValues.length === 0) {
      return null;
    }

    const min = Math.min(...cashbackValues);
    const max = Math.max(...cashbackValues);

    return { min, max };
  }, [company.cashbackRate, company.plans, rates]);

  const cashbackDisplay = useMemo(() => {
    if (!cashbackRange) {
      return "Brak";
    }

    if (cashbackRange.min === cashbackRange.max) {
      return `$${cashbackRange.min.toFixed(2)}`;
    }

    return `od $${cashbackRange.min.toFixed(2)} do $${cashbackRange.max.toFixed(2)}`;
  }, [cashbackRange]);

  const stats = [
    {
      label: "Cashback",
      value: cashbackDisplay,
      icon: Award,
      isGreen: cashbackRange !== null,
    },
    {
      label: "Ocena ogólna",
      value: company.rating ? company.rating.toFixed(1) : "Brak",
      icon: Star,
      isGreen: false,
    },
    {
      label: "Dostępne plany",
      value: company.plans.length,
      icon: Layers,
      isGreen: false,
    },
    {
      label: "Opinie",
      value: company.reviews.length,
      icon: MessageSquare,
      isGreen: false,
    },
    {
      label: "Status weryfikacji",
      value: company.verificationStatus ? "" : "Niezweryfikowana",
      icon: ShieldCheck,
      isGreen: false,
      badge: company.verificationStatus ? (
        <Badge variant="outline" className="text-[9px] font-normal border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1 py-0 leading-tight">
          Zweryfikowana
        </Badge>
      ) : null,
    },
  ];

  return (
    <section ref={sectionAnim.ref} className={cn("space-y-3", sectionAnim.className)}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold sm:text-xl">Kluczowe statystyki</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Najważniejsze informacje o firmie w jednym miejscu.
        </p>
      </div>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="rounded-lg border border-border/40 bg-background/60 backdrop-blur-[36px]! p-2.5 shadow-xs transition-all hover:border-border/60 hover:bg-card/66"
            >
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{stat.label}:</span>
                  <span
                    className={cn(
                      "text-xs font-semibold truncate",
                      stat.isGreen ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
                    )}
                  >
                    {stat.value}
                  </span>
                  {stat.badge}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

