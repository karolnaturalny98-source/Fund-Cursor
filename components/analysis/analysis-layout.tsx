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
import Aurora from "@/components/Aurora";
import { cn } from "@/lib/utils";
import type { CompanyWithDetails, CompanyRankingHistory, PriceHistoryPoint } from "@/lib/types";
import type { ReviewStatistics, ComparisonMetrics } from "@/lib/queries/analysis";
import { MetricsDashboard } from "./metrics-dashboard";
import { PriceComparisonChart } from "./price-comparison-chart";
import { RatingTrendsChart } from "./rating-trends-chart";
import { PlanFeaturesMatrix } from "./plan-features-matrix";
import { ReviewSentiment } from "./review-sentiment";
import { ReviewStatistics as ReviewStatisticsComponent } from "./review-statistics";
import { TradingConditions } from "./trading-conditions";
import { CompanyProfile } from "./company-profile";
import { PayoutAnalysis } from "./payout-analysis";

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
      <div className="fixed inset-0 -z-10" style={{ height: '100vh' }}>
        <Aurora
          colorStops={["#1e5a3d", "#34d399", "#a7f3d0"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      <div className="container space-y-10 py-10">
        {/* Header */}
        <div className="space-y-4">
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
            className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Zmień wybór firm
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold sm:text-4xl">Analiza porównawcza</h1>
            <Badge variant="outline" className="text-sm">
              {companies.length} {companies.length === 1 ? "firma" : "firmy"}
            </Badge>
          </div>

          {/* Selected Companies */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Card
                key={company.id}
                className="group flex items-center gap-3 rounded-3xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] p-4 shadow-sm transition-all hover:border-gradient hover:shadow-premium"
              >
                {company.logoUrl ? (
                  <Avatar className="h-12 w-12 rounded-xl border-2 border-primary/20 shadow-md ring-2 ring-primary/10">
                    <AvatarImage src={company.logoUrl} alt={company.name} className="object-cover" />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-semibold">
                      {company.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                    <span className="text-sm font-semibold text-muted-foreground">
                      {company.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{company.name}</h3>
                  {company.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm text-muted-foreground">
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className={cn(
                "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground hover:border-gradient hover:bg-gradient-card hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Przegląd</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="plans"
              className={cn(
                "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground hover:border-gradient hover:bg-gradient-card hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Plany i ceny</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="trading"
              className={cn(
                "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground hover:border-gradient hover:bg-gradient-card hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Warunki handlowe</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className={cn(
                "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground hover:border-gradient hover:bg-gradient-card hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Opinie</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="payouts"
              className={cn(
                "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground hover:border-gradient hover:bg-gradient-card hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Wypłaty</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="company"
              className={cn(
                "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground hover:border-gradient hover:bg-gradient-card hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Profile firm</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-10">
            <MetricsDashboard
              companies={companies}
              comparisonMetrics={comparisonMetrics}
            />
            
            <div className="grid gap-6 lg:grid-cols-2">
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
          <TabsContent value="plans" className="space-y-10">
            <PlanFeaturesMatrix companies={companies} />
            <PriceComparisonChart
              companies={companies}
              priceHistory={priceHistory}
            />
          </TabsContent>

          {/* Trading Conditions Tab */}
          <TabsContent value="trading" className="space-y-10">
            <TradingConditions companies={companies} />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-10">
            <ReviewStatisticsComponent
              companies={companies}
              reviewStatistics={reviewStatistics}
            />
            <ReviewSentiment companies={companies} />
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-10">
            <PayoutAnalysis companies={companies} />
          </TabsContent>

          {/* Company Profiles Tab */}
          <TabsContent value="company" className="space-y-10">
            <CompanyProfile companies={companies} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

