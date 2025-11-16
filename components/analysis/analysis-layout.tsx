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
import { useComparisonData } from "@/components/analysis/hooks/use-comparison-data";
import { useComparisonCharts } from "@/components/analysis/hooks/use-comparison-charts";
import { getCountryFlag } from "@/lib/country";

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
  const { companyCards, metrics, reviewSummary } = useComparisonData({
    companies,
    comparisonMetrics,
    reviewStatistics,
  });
  const { priceChart, ratingChart } = useComparisonCharts({
    companies,
    priceHistory,
    ratingHistory,
  });

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

      <div className="container flex flex-col fluid-stack-3xl fluid-section-pad">
        {/* Header */}
        <div className="flex flex-col fluid-stack-lg">
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
            className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground fluid-caption"
          >
            <ArrowLeft className="fluid-icon-sm" /> Zmień wybór firm
          </Link>

          <div className="flex flex-wrap items-center fluid-stack-sm">
            <h1 className="fluid-h1 font-bold">Analiza porównawcza</h1>
            <Badge variant="outline" className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] font-semibold">
              {companies.length} {companies.length === 1 ? "firma" : "firmy"}
            </Badge>
          </div>

          {/* Selected Companies */}
          <div className="grid fluid-grid-gap-md sm:grid-cols-2 lg:grid-cols-3">
            {companyCards.map((card) => (
              <Card
                key={card.id}
                variant="elevated"
                className="group flex items-center gap-4 p-6 transition-all hover:border-primary/40"
              >
                {card.logoUrl ? (
                  <Avatar size="lg" className="rounded-xl border-2 border-primary/20 shadow-md ring-2 ring-primary/10">
                    <AvatarImage src={card.logoUrl} alt={card.name} className="object-cover" />
                    <AvatarFallback className="rounded-xl bg-linear-to-br from-primary/20 to-primary/10 text-sm font-semibold">
                      {card.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 p-4">
                    <span className="font-semibold text-muted-foreground fluid-copy">
                      {card.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-semibold text-foreground fluid-copy">
                    {card.name}
                  </h3>
                  {card.rating && (
                    <div className="mt-2 flex items-center gap-2">
                      <Star className="fluid-icon-sm fill-amber-400 text-amber-400" />
                      <span className="fluid-caption text-muted-foreground">
                        {card.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {card.country ? (
                      <Badge variant="outline" className="inline-flex items-center gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full text-xs font-medium">
                        {getCountryFlag(card.country)} {card.country}
                      </Badge>
                    ) : null}
                    {card.highlights.map((highlight) => (
                      <Badge key={`${card.id}-${highlight.label}`} variant="secondary" className="inline-flex items-center gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full text-xs font-medium">
                        {highlight.label}: {highlight.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {reviewSummary.totalReviews > 0 ? (
            <p className="text-muted-foreground fluid-caption">
              Łącznie opinii: <strong>{reviewSummary.totalReviews}</strong> · Zweryfikowane:{" "}
              <strong>{reviewSummary.verifiedCount}</strong> · Średnia ocena:{" "}
              <strong>{reviewSummary.averageRating.toFixed(2)}</strong>
            </p>
          ) : null}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col fluid-stack-2xl">
          <TabsList className="flex flex-wrap gap-3 bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className={cn(
                "inline-flex items-center gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full border border-transparent bg-muted/30 text-sm font-semibold text-muted-foreground transition-all",
                "data-[state=inactive]:hover:border-primary/50 data-[state=inactive]:hover:bg-card/95 data-[state=inactive]:hover:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]",
                "data-[state=active]:border-primary/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]"
              )}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="fluid-icon-sm" />
                <span>Przegląd</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="plans"
              className={cn(
                "inline-flex items-center gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full border border-transparent bg-muted/30 text-sm font-semibold text-muted-foreground transition-all",
                "data-[state=inactive]:hover:border-primary/50 data-[state=inactive]:hover:bg-card/95 data-[state=inactive]:hover:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]",
                "data-[state=active]:border-primary/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]"
              )}
            >
              <div className="flex items-center gap-2">
                <FileText className="fluid-icon-sm" />
                <span>Plany i ceny</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="trading"
              className={cn(
                "inline-flex items-center gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full border border-transparent bg-muted/30 text-sm font-semibold text-muted-foreground transition-all",
                "data-[state=inactive]:hover:border-primary/50 data-[state=inactive]:hover:bg-card/95 data-[state=inactive]:hover:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]",
                "data-[state=active]:border-primary/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]"
              )}
            >
              <div className="flex items-center gap-2">
                <Settings className="fluid-icon-sm" />
                <span>Warunki handlowe</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className={cn(
                "inline-flex items-center gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full border border-transparent bg-muted/30 text-sm font-semibold text-muted-foreground transition-all",
                "data-[state=inactive]:hover:border-primary/50 data-[state=inactive]:hover:bg-card/95 data-[state=inactive]:hover:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]",
                "data-[state=active]:border-primary/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]"
              )}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="fluid-icon-sm" />
                <span>Opinie</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="payouts"
              className={cn(
                "inline-flex items-center gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full border border-transparent bg-muted/30 text-sm font-semibold text-muted-foreground transition-all",
                "data-[state=inactive]:hover:border-primary/50 data-[state=inactive]:hover:bg-card/95 data-[state=inactive]:hover:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]",
                "data-[state=active]:border-primary/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]"
              )}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="fluid-icon-sm" />
                <span>Wypłaty</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="company"
              className={cn(
                "inline-flex items-center gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full border border-transparent bg-muted/30 text-sm font-semibold text-muted-foreground transition-all",
                "data-[state=inactive]:hover:border-primary/50 data-[state=inactive]:hover:bg-card/95 data-[state=inactive]:hover:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]",
                "data-[state=active]:border-primary/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]"
              )}
            >
              <div className="flex items-center gap-2">
                <Building2 className="fluid-icon-sm" />
                <span>Profile firm</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex flex-col fluid-stack-2xl">
            {activeTab === "overview" && (
              <>
                <MetricsDashboard
                  metrics={metrics}
                  regulationCards={companies.map((company) => ({
                    id: company.id,
                    name: company.name,
                    regulation: company.regulation ?? null,
                    country: company.country ?? null,
                    licenses: company.licenses ?? [],
                  }))}
                />
                <div className="grid fluid-grid-gap-lg lg:grid-cols-2">
                  <PriceComparisonChart data={priceChart} />
                  <RatingTrendsChart data={ratingChart} />
                </div>
              </>
            )}
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="flex flex-col fluid-stack-2xl">
            {activeTab === "plans" && (
              <>
                <PlanFeaturesMatrix companies={companies} />
                <PriceComparisonChart data={priceChart} />
              </>
            )}
          </TabsContent>

          {/* Trading Conditions Tab */}
          <TabsContent value="trading" className="flex flex-col fluid-stack-2xl">
            {activeTab === "trading" && <TradingConditions companies={companies} />}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="flex flex-col fluid-stack-2xl">
            {activeTab === "reviews" && (
              <>
                <ReviewStatisticsComponent
                  companies={companies}
                  reviewStatistics={reviewStatistics}
                />
                <ReviewSentiment companies={companies} />
              </>
            )}
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="flex flex-col fluid-stack-2xl">
            {activeTab === "payouts" && <PayoutAnalysis companies={companies} />}
          </TabsContent>

          {/* Company Profiles Tab */}
          <TabsContent value="company" className="flex flex-col fluid-stack-2xl">
            {activeTab === "company" && <CompanyProfile companies={companies} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
