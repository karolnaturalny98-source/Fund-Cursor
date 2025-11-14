"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Star } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HomeRankingTab, RankingCompanySnapshot } from "@/lib/types/rankings";
import { formatCurrencyLocalized } from "@/lib/currency";

export type RankingTabsSectionProps = {
  tabs: HomeRankingTab[];
  variant?: "home" | "full";
};

export function RankingTabsSection({ tabs, variant = "home" }: RankingTabsSectionProps) {
  if (!tabs.length) {
    return null;
  }

  return (
    <Tabs defaultValue={tabs[0]?.id ?? ""} className="w-full">
      <TabsList className="flex w-full flex-wrap justify-start gap-2 overflow-x-auto border border-border/50 bg-card/60 p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="rounded-full px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => {
        const containerClasses =
          variant === "full"
            ? "mt-6 space-y-5 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-xs"
            : "mt-6 space-y-4 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-xs";

        return (
          <TabsContent key={tab.id} value={tab.id} className={containerClasses}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">{tab.description}</p>
              <Button
                asChild
                variant="ghost"
                className="flex items-center gap-2 text-sm font-semibold text-primary"
              >
                <Link href="/rankingi" prefetch={false}>
                  Pełny ranking
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className={variant === "full" ? "space-y-4" : "space-y-3"}>
              {tab.companies.map((company, index) => (
                <div
                  key={company.id}
                  className="flex flex-col gap-4 rounded-xl border border-border/40 bg-background/50 p-4 transition hover:border-primary/30 hover:bg-background/70 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3 sm:w-1/3">
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-semibold">
                      #{index + 1}
                    </Badge>
                    <div className="flex items-center gap-3">
                      <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
                      <div className="space-y-1">
                        <Link
                          href={`/firmy/${company.slug}`}
                          className="text-sm font-semibold text-foreground transition hover:text-primary"
                          prefetch={false}
                        >
                          {company.name}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {company.headline ?? company.country ?? "Globalny rynek"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-wrap items-center gap-3 text-xs text-muted-foreground sm:justify-end">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" />
                      {company.averageRating ? company.averageRating.toFixed(1) : "—"}{" "}
                      • {company.reviewCount.toLocaleString("pl-PL")} opinii
                    </div>
                    <div>{renderMetric(tab.id, company)}</div>
                    <div className="font-semibold text-foreground">
                      Trend: {company.trendRatio >= 0 ? "+" : ""}
                      {company.trendRatio.toFixed(1)}%
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:w-40">
                    <Button
                      asChild
                      size="sm"
                      className="rounded-full"
                    >
                      <Link href={`/firmy/${company.slug}`} prefetch={false}>
                        Przejdź z kodem
                      </Link>
                    </Button>
                    <p className="text-[11px] leading-tight">
                      Zgarnij cashback z naszego linka
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function CompanyLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    return (
      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border/40 bg-background">
        <Image src={logoUrl} alt={name} fill className="object-contain" sizes="40px" />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/40 bg-primary/10 text-xs font-semibold uppercase text-primary">
      {name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")}
    </div>
  );
}

function renderMetric(tabId: string, company: RankingCompanySnapshot): ReactNode {
  switch (tabId) {
    case "opinions":
      return (
        <span className="font-semibold text-foreground">
          Śr. ocena: {company.averageRating ? company.averageRating.toFixed(2) : "—"}
        </span>
      );
    case "cashback":
      return (
        <span className="font-semibold text-foreground">
          Cashback: {company.cashbackRate ? `${company.cashbackRate}%` : "—"}
        </span>
      );
    case "price":
      return (
        <span className="font-semibold text-foreground">
          Od{" "}
          {typeof company.maxPlanPrice === "number"
            ? formatCurrencyLocalized(company.maxPlanPrice, "USD", "pl-PL")
            : "—"}
        </span>
      );
    case "payouts":
      return (
        <span className="font-semibold text-foreground">
          Wypłaty:{" "}
          {typeof company.cashbackPayoutHours === "number"
            ? `${company.cashbackPayoutHours.toFixed(0)}h`
            : `${company.scores?.payouts.toFixed(1)} pkt`}
        </span>
      );
    default:
      return (
        <span className="font-semibold text-foreground">
          Wynik: {company.scores?.overall.toFixed(1)}
        </span>
      );
  }
}
