"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, AlertCircle, Plus, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { CashbackOverviewTab } from "./cashback-overview-tab";
import { CashbackQueuesTab } from "./cashback-queues-tab";
import { CashbackOperationsTab } from "./cashback-operations-tab";
import { CashbackHistoryTab } from "./cashback-history-tab";
import type { AffiliateQueueItem, AffiliateVerificationItem } from "@/lib/queries/affiliates";
import type { ManualCashbackQueueItem } from "@/lib/queries/transactions";
import type {
  CashbackStats,
  TransactionTimeSeriesPoint,
  StatusDistribution,
  TopCompany,
} from "@/lib/queries/cashback-stats";
import type { Company } from "@/lib/types";
import type { RedeemQueueItem } from "./redeem-queue-table";

interface CashbackDashboardProps {
  stats: CashbackStats;
  timeSeries: TransactionTimeSeriesPoint[];
  statusDistribution: StatusDistribution[];
  topCompanies: TopCompany[];
  redeemQueue: RedeemQueueItem[];
  affiliateQueue: AffiliateQueueItem[];
  verificationQueue: AffiliateVerificationItem[];
  manualPendingQueue: ManualCashbackQueueItem[];
  companies: Array<Pick<Company, "id" | "name" | "slug">>;
}

export function CashbackDashboard({
  stats,
  timeSeries,
  statusDistribution,
  topCompanies,
  redeemQueue,
  affiliateQueue,
  verificationQueue,
  manualPendingQueue,
  companies,
}: CashbackDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Cashback</h1>
        <p className="text-muted-foreground">
          Zarządzaj transakcjami afiliacyjnymi, wnioskami o wypłatę i historią operacji cashback
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
            value="operations"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Operacje</span>
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
          <CashbackOverviewTab
            stats={stats}
            timeSeries={timeSeries}
            statusDistribution={statusDistribution}
            topCompanies={topCompanies}
          />
        </TabsContent>

        <TabsContent value="queues" className="space-y-6">
          <CashbackQueuesTab
            redeemQueue={redeemQueue}
            affiliateQueue={affiliateQueue}
            verificationQueue={verificationQueue}
            manualPendingQueue={manualPendingQueue}
          />
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <CashbackOperationsTab companies={companies} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <CashbackHistoryTab companies={companies} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


