"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ShopOverviewTab } from "./shop-overview-tab";
import { ShopOrdersTab } from "./shop-orders-tab";
import { ShopAnalyticsTab } from "./shop-analytics-tab";
import type { TimePeriod, TimeRange } from "./shop-time-filter";
import type {
  ShopRevenueStats,
  ShopTopCompany,
  ShopTopPlan,
  ShopOrderItem,
} from "@/lib/queries/shop";
import type { ClickAnalyticsResult } from "@/lib/queries/analytics";

interface ShopDashboardProps {
  stats: ShopRevenueStats;
  topCompanies: ShopTopCompany[];
  topPlans: ShopTopPlan[];
  recentOrders: ShopOrderItem[];
  clickAnalytics: ClickAnalyticsResult;
}

export function ShopDashboard({
  stats,
  topCompanies,
  topPlans,
  recentOrders,
  clickAnalytics,
}: ShopDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("last30days");
  const [timeRange, setTimeRange] = useState<TimeRange | undefined>(undefined);

  const handlePeriodChange = (period: TimePeriod, range?: TimeRange) => {
    setSelectedPeriod(period);
    setTimeRange(range);
    // Tutaj można dodać logikę do przeładowania danych z filtrem czasowym
    // Na razie komponenty wyświetlają dane dla całego okresu
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Sklepu</h1>
        <p className="text-muted-foreground">
          Statystyki, wykresy, analityka kliknięć i zarządzanie zamówieniami ze sklepu
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground hover:border-gradient hover:bg-gradient-card hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            Przegląd
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground hover:border-gradient hover:bg-gradient-card hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            Zamówienia
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground hover:border-gradient hover:bg-gradient-card hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            Analityka
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ShopOverviewTab
            stats={stats}
            topCompanies={topCompanies}
            topPlans={topPlans}
            selectedPeriod={selectedPeriod}
            timeRange={timeRange}
            onPeriodChange={handlePeriodChange}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <ShopOrdersTab orders={recentOrders} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ShopAnalyticsTab clickAnalytics={clickAnalytics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
