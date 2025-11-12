"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, AlertCircle, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { SupportOverviewTab } from "./support-overview-tab";
import { SupportQueuesTab } from "./support-queues-tab";
import { SupportHistoryTab } from "./support-history-tab";
import type {
  SupportStats,
  SupportTimeSeriesPoint,
  StatusDistribution,
  TopDisputedCompany,
} from "@/lib/queries/support-stats";
import type { DisputeCase, DisputeStatus } from "@/lib/types";

interface SupportDashboardProps {
  stats: SupportStats;
  timeSeries: SupportTimeSeriesPoint[];
  statusDistribution: StatusDistribution[];
  topCompanies: TopDisputedCompany[];
  initialDisputes: DisputeCase[];
  initialTotals: Record<DisputeStatus, number>;
  initialNextCursor: string | null;
  initialStatus: "ALL" | DisputeStatus;
  initialQuery: string;
}

export function SupportDashboard({
  stats,
  timeSeries,
  statusDistribution,
  topCompanies,
  initialDisputes,
  initialTotals,
  initialNextCursor,
  initialStatus,
  initialQuery,
}: SupportDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Wsparcia</h1>
        <p className="text-muted-foreground">
          Zarządzaj zgłoszeniami użytkowników, monitoruj spory i rozwiązuj problemy.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Przegląd</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="queues"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Kolejki</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Historia</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SupportOverviewTab
            stats={stats}
            timeSeries={timeSeries}
            statusDistribution={statusDistribution}
            topCompanies={topCompanies}
          />
        </TabsContent>

        <TabsContent value="queues" className="space-y-6">
          <SupportQueuesTab
            initialItems={initialDisputes}
            initialTotals={initialTotals}
            initialNextCursor={initialNextCursor}
            initialStatus={initialStatus}
            initialQuery={initialQuery}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <SupportHistoryTab
            initialItems={initialDisputes}
            initialTotals={initialTotals}
            initialNextCursor={initialNextCursor}
            initialQuery={initialQuery}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

