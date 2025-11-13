"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, FileText, MessageSquare, Building2, DollarSign, Settings, Star } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { CompanyWithDetails, CompanyRankingHistory, PriceHistoryPoint } from "@/lib/types";
import type { ReviewStatistics, ComparisonMetrics } from "@/lib/queries/analysis";
import dynamic from "next/dynamic";
import { MetricsDashboard } from "./metrics-dashboard";

const Aurora = dynamic(() => import("@/components/Aurora"), { ssr: false });
import { PlanFeaturesMatrix } from "./plan-features-matrix";
import { ReviewSentiment } from "./review-sentiment";
import { ReviewStatistics as ReviewStatisticsComponent } from "./review-statistics";
import { TradingConditions } from "./trading-conditions";
import { CompanyProfile } from "./company-profile";
import { ChartSkeleton } from "./loading-skeleton";

const PriceComparisonChart = dynamic(
  () => import("./price-comparison-chart").then((mod) => ({ default: mod.PriceComparisonChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const RatingTrendsChart = dynamic(
  () => import("./rating-trends-chart").then((mod) => ({ default: mod.RatingTrendsChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const PayoutAnalysis = dynamic(
  () => import("./payout-analysis").then((mod) => ({ default: mod.PayoutAnalysis })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface AnalysisLayoutProps {
  companies: CompanyWithDetails[];
  priceHistory: Record<string, PriceHistoryPoint[]>;
  ratingHistory: Record<string, CompanyRankingHistory[]>;
  reviewStatistics: Record<string, ReviewStatistics>;
  comparisonMetrics: Record<string, ComparisonMetrics>;
}

export function AnalysisLayout({
  companies,
  priceHistory,
  ratingHistory,
  reviewStatistics,
  comparisonMetrics,
}: AnalysisLayoutProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="relative">
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 h-screen">
        <Aurora
          colorStops={["#34D399", "#a78bfa", "#3b82f6"]}
          blend={0.35}
          amplitude={0.7}
          speed={0.5}
        />
      </div>

      <div className="container space-y-[clamp(2.5rem,3.5vw,3.75rem)] py-[clamp(2.5rem,3vw,3.5rem)]">
        {/* Header */}
        <div className="space-y-[clamp(1rem,1.6vw,1.5rem)]">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/analizy">Analizy</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Porównanie</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Link
            href="/analizy"
            className="inline-flex items-center gap-[clamp(0.35rem,0.6vw,0.55rem)] text-muted-foreground transition hover:text-foreground fluid-caption"
          >
            <ArrowLeft className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" /> Zmień wybór firm
          </Link>

          <div className="flex flex-wrap items-center gap-[clamp(0.75rem,1.2vw,1.1rem)]">
            <h1 className="fluid-h1 font-bold">Analiza porównawcza</h1>
            <Badge variant="outline" className="fluid-badge font-semibold">
              {companies.length} {companies.length === 1 ? "firma" : "firmy"}
            </Badge>
          </div>

          {/* Selected Companies */}
          <div className="grid gap-[clamp(1rem,1.5vw,1.5rem)] sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Card
                key={company.id}
                className="group flex items-center gap-[clamp(0.85rem,1.2vw,1.1rem)] rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-[clamp(1.1rem,1.6vw,1.5rem)] shadow-xs transition-all hover:border-gradient hover:shadow-premium"
              >
                {company.logoUrl ? (
                  <Avatar className="h-[clamp(2.75rem,2.6vw+2.1rem,3.4rem)] w-[clamp(2.75rem,2.6vw+2.1rem,3.4rem)] rounded-xl border-2 border-primary/20 shadow-md ring-2 ring-primary/10">
                    <AvatarImage src={company.logoUrl} alt={company.name} className="object-cover" />
                    <AvatarFallback className="rounded-xl bg-linear-to-br from-primary/20 to-primary/10 text-sm font-semibold">
                      {company.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex h-[clamp(2.75rem,2.6vw+2.1rem,3.4rem)] w-[clamp(2.75rem,2.6vw+2.1rem,3.4rem)] items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10">
                    <span className="text-[clamp(0.95rem,0.4vw+0.85rem,1.05rem)] font-semibold text-muted-foreground">
                      {company.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="truncate text-[clamp(0.95rem,0.4vw+0.85rem,1.05rem)] font-semibold text-foreground">
                    {company.name}
                  </h3>
                  {company.rating && (
                    <div className="mt-[clamp(0.35rem,0.5vw,0.45rem)] flex items-center gap-[clamp(0.35rem,0.6vw,0.5rem)]">
                      <Star className="h-[clamp(0.9rem,0.35vw+0.8rem,1rem)] w-[clamp(0.9rem,0.35vw+0.8rem,1rem)] fill-amber-400 text-amber-400" />
                      <span className="fluid-caption text-muted-foreground">
                        {company.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-[clamp(2rem,3vw,3rem)]">
          <TabsList className="flex flex-wrap gap-[clamp(0.75rem,1.2vw,1.1rem)] bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className={cn(
                "group inline-flex min-w-[clamp(8.5rem,12vw,10.5rem)] items-center justify-between gap-[clamp(0.65rem,1vw,0.9rem)] rounded-full border px-[clamp(1.15rem,1.8vw,1.5rem)] py-[clamp(0.55rem,0.9vw,0.75rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground",
                "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
            >
              <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                <BarChart3 className="h-[clamp(1rem,0.4vw+0.9rem,1.1rem)] w-[clamp(1rem,0.4vw+0.9rem,1.1rem)]" />
                <span>Przegląd</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="plans"
              className={cn(
                "group inline-flex min-w-[clamp(8.5rem,12vw,10.5rem)] items-center justify-between gap-[clamp(0.65rem,1vw,0.9rem)] rounded-full border px-[clamp(1.15rem,1.8vw,1.5rem)] py-[clamp(0.55rem,0.9vw,0.75rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground",
                "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
            >
              <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                <FileText className="h-[clamp(1rem,0.4vw+0.9rem,1.1rem)] w-[clamp(1rem,0.4vw+0.9rem,1.1rem)]" />
                <span>Plany i ceny</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="trading"
              className={cn(
                "group inline-flex min-w-[clamp(8.5rem,12vw,10.5rem)] items-center justify-between gap-[clamp(0.65rem,1vw,0.9rem)] rounded-full border px-[clamp(1.15rem,1.8vw,1.5rem)] py-[clamp(0.55rem,0.9vw,0.75rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground",
                "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
            >
              <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                <Settings className="h-[clamp(1rem,0.4vw+0.9rem,1.1rem)] w-[clamp(1rem,0.4vw+0.9rem,1.1rem)]" />
                <span>Warunki handlowe</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className={cn(
                "group inline-flex min-w-[clamp(8.5rem,12vw,10.5rem)] items-center justify-between gap-[clamp(0.65rem,1vw,0.9rem)] rounded-full border px-[clamp(1.15rem,1.8vw,1.5rem)] py-[clamp(0.55rem,0.9vw,0.75rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground",
                "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
            >
              <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                <MessageSquare className="h-[clamp(1rem,0.4vw+0.9rem,1.1rem)] w-[clamp(1rem,0.4vw+0.9rem,1.1rem)]" />
                <span>Opinie</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="payouts"
              className={cn(
                "group inline-flex min-w-[clamp(8.5rem,12vw,10.5rem)] items-center justify-between gap-[clamp(0.65rem,1vw,0.9rem)] rounded-full border px-[clamp(1.15rem,1.8vw,1.5rem)] py-[clamp(0.55rem,0.9vw,0.75rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground",
                "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
            >
              <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                <DollarSign className="h-[clamp(1rem,0.4vw+0.9rem,1.1rem)] w-[clamp(1rem,0.4vw+0.9rem,1.1rem)]" />
                <span>Wypłaty</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="company"
              className={cn(
                "group inline-flex min-w-[clamp(8.5rem,12vw,10.5rem)] items-center justify-between gap-[clamp(0.65rem,1vw,0.9rem)] rounded-full border px-[clamp(1.15rem,1.8vw,1.5rem)] py-[clamp(0.55rem,0.9vw,0.75rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground",
                "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
            >
              <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                <Building2 className="h-[clamp(1rem,0.4vw+0.9rem,1.1rem)] w-[clamp(1rem,0.4vw+0.9rem,1.1rem)]" />
                <span>Profile firm</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-[clamp(2rem,3vw,3rem)]">
            <MetricsDashboard
              companies={companies}
              comparisonMetrics={comparisonMetrics}
            />
            
            <div className="grid gap-[clamp(1.5rem,2.2vw,2rem)] lg:grid-cols-2">
              <PriceComparisonChart
                companies={companies}
                priceHistory={priceHistory}
              />
              <RatingTrendsChart
                companies={companies}
                ratingHistory={ratingHistory}
              />
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-[clamp(2rem,3vw,3rem)]">
            <PlanFeaturesMatrix companies={companies} />
            <PriceComparisonChart
              companies={companies}
              priceHistory={priceHistory}
            />
          </TabsContent>

          {/* Trading Conditions Tab */}
          <TabsContent value="trading" className="space-y-[clamp(2rem,3vw,3rem)]">
            <TradingConditions companies={companies} />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-[clamp(2rem,3vw,3rem)]">
            <ReviewStatisticsComponent
              companies={companies}
              reviewStatistics={reviewStatistics}
            />
            <ReviewSentiment companies={companies} />
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-[clamp(2rem,3vw,3rem)]">
            <PayoutAnalysis companies={companies} />
          </TabsContent>

          {/* Company Profiles Tab */}
          <TabsContent value="company" className="space-y-[clamp(2rem,3vw,3rem)]">
            <CompanyProfile companies={companies} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

