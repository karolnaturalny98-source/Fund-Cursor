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
  const triggerBaseClasses =
    "group inline-flex min-w-[clamp(7.75rem,11vw,9.75rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.15rem,1.65vw,1.45rem)] py-[clamp(0.55rem,0.8vw,0.7rem)] text-[clamp(0.82rem,0.3vw+0.75rem,0.95rem)] font-semibold transition-all";
  const triggerStateClasses =
    "border-transparent bg-muted/30 text-muted-foreground data-[state=inactive]:hover:border-primary/40 data-[state=inactive]:hover:bg-primary/10 data-[state=inactive]:hover:shadow-[0_30px_65px_-40px_rgba(15,23,42,0.45)] data-[state=active]:border-primary/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]";

  return (
    <div className="flex flex-col fluid-stack-lg">
      <div className="flex flex-col fluid-stack-sm">
        <h1 className="fluid-h2 font-semibold tracking-tight text-foreground">Dashboard Cashback</h1>
        <p className="max-w-2xl fluid-copy text-muted-foreground">
          Zarządzaj transakcjami afiliacyjnymi, wnioskami o wypłatę i historią operacji cashback
        </p>
      </div>

      <Tabs defaultValue="overview" className="flex flex-col fluid-stack-lg">
        <TabsList className="flex flex-wrap gap-[clamp(0.55rem,0.85vw,0.75rem)] bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className={cn(
              triggerBaseClasses,
              triggerStateClasses
            )}
          >
            <div className="flex items-center gap-[clamp(0.4rem,0.6vw,0.5rem)]">
              <LayoutDashboard className="h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)]" />
              <span className="font-semibold">Przegląd</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="queues"
            className={cn(
              triggerBaseClasses,
              triggerStateClasses
            )}
          >
            <div className="flex items-center gap-[clamp(0.4rem,0.6vw,0.5rem)]">
              <AlertCircle className="h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)]" />
              <span className="font-semibold">Kolejki</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="operations"
            className={cn(
              triggerBaseClasses,
              triggerStateClasses
            )}
          >
            <div className="flex items-center gap-[clamp(0.4rem,0.6vw,0.5rem)]">
              <Plus className="h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)]" />
              <span className="font-semibold">Operacje</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className={cn(
              triggerBaseClasses,
              triggerStateClasses
            )}
          >
            <div className="flex items-center gap-[clamp(0.4rem,0.6vw,0.5rem)]">
              <History className="h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)]" />
              <span className="font-semibold">Historia</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col fluid-stack-lg">
          <CashbackOverviewTab
            stats={stats}
            timeSeries={timeSeries}
            statusDistribution={statusDistribution}
            topCompanies={topCompanies}
          />
        </TabsContent>

        <TabsContent value="queues" className="flex flex-col fluid-stack-lg">
          <CashbackQueuesTab
            redeemQueue={redeemQueue}
            affiliateQueue={affiliateQueue}
            verificationQueue={verificationQueue}
            manualPendingQueue={manualPendingQueue}
          />
        </TabsContent>

        <TabsContent value="operations" className="flex flex-col fluid-stack-lg">
          <CashbackOperationsTab companies={companies} />
        </TabsContent>

        <TabsContent value="history" className="flex flex-col fluid-stack-lg">
          <CashbackHistoryTab companies={companies} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


