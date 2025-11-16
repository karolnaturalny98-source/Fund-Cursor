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
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

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
  const triggerBaseClasses =
    "group inline-flex min-w-[clamp(7.75rem,11vw,10rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.15rem,1.65vw,1.45rem)] py-[clamp(0.55rem,0.8vw,0.7rem)] text-[clamp(0.82rem,0.3vw+0.75rem,0.95rem)] font-semibold transition-all";
  const triggerStateClasses =
    "border-transparent bg-muted/30 text-muted-foreground data-[state=inactive]:hover:border-primary/50 data-[state=inactive]:hover:bg-card/95 data-[state=inactive]:hover:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)] data-[state=active]:border-primary/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]";

  return (
    <div className="flex flex-col fluid-stack-lg">
      <div className="flex flex-col fluid-stack-sm">
        <Heading level={1} variant="page">
          Dashboard Wsparcia
        </Heading>
        <Text variant="body" tone="muted" className="max-w-2xl">
          Zarządzaj zgłoszeniami użytkowników, monitoruj spory i rozwiązuj problemy.
        </Text>
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
          <SupportOverviewTab
            stats={stats}
            timeSeries={timeSeries}
            statusDistribution={statusDistribution}
            topCompanies={topCompanies}
          />
        </TabsContent>

        <TabsContent value="queues" className="flex flex-col fluid-stack-lg">
          <SupportQueuesTab
            initialItems={initialDisputes}
            initialTotals={initialTotals}
            initialNextCursor={initialNextCursor}
            initialStatus={initialStatus}
            initialQuery={initialQuery}
          />
        </TabsContent>

        <TabsContent value="history" className="flex flex-col fluid-stack-lg">
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
