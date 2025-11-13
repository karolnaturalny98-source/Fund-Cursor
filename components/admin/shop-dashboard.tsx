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

  const triggerBaseClasses =
    "group inline-flex min-w-[clamp(7.75rem,11vw,10rem)] items-center justify-center gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.15rem,1.65vw,1.45rem)] py-[clamp(0.55rem,0.8vw,0.7rem)] text-[clamp(0.82rem,0.3vw+0.75rem,0.95rem)] font-semibold transition-all";
  const triggerStateClasses =
    "border-transparent bg-muted/30 text-muted-foreground data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium";

  return (
    <div className="space-y-[clamp(1.5rem,2.3vw,2.1rem)]">
      <div className="space-y-[clamp(0.55rem,0.85vw,0.75rem)]">
        <h1 className="fluid-h2 font-semibold tracking-tight text-foreground">Dashboard Sklepu</h1>
        <p className="max-w-2xl fluid-copy text-muted-foreground">
          Statystyki, wykresy, analityka kliknięć i zarządzanie zamówieniami ze sklepu
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-[clamp(1.25rem,1.9vw,1.7rem)]">
        <TabsList className="flex flex-wrap gap-[clamp(0.55rem,0.85vw,0.75rem)] bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className={cn(
              triggerBaseClasses,
              triggerStateClasses
            )}
          >
            Przegląd
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className={cn(
              triggerBaseClasses,
              triggerStateClasses
            )}
          >
            Zamówienia
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className={cn(
              triggerBaseClasses,
              triggerStateClasses
            )}
          >
            Analityka
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-[clamp(1.25rem,1.9vw,1.7rem)]">
          <ShopOverviewTab
            stats={stats}
            topCompanies={topCompanies}
            topPlans={topPlans}
            selectedPeriod={selectedPeriod}
            timeRange={timeRange}
            onPeriodChange={handlePeriodChange}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-[clamp(1.25rem,1.9vw,1.7rem)]">
          <ShopOrdersTab orders={recentOrders} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-[clamp(1.25rem,1.9vw,1.7rem)]">
          <ShopAnalyticsTab clickAnalytics={clickAnalytics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
