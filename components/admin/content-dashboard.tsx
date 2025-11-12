"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Building2, Plus, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentOverviewTab } from "./content-overview-tab";
import { ContentManagementTab } from "./content-management-tab";
import { ContentOperationsTab } from "./content-operations-tab";
import { ContentHistoryTab } from "./content-history-tab";
import type {
  ContentStats,
  ContentTimeSeriesPoint,
  StatusDistribution,
  TopCompany,
} from "@/lib/queries/content-stats";
import type { AdminCompany } from "@/lib/queries/companies";

interface ContentDashboardProps {
  stats: ContentStats;
  timeSeries: ContentTimeSeriesPoint[];
  statusDistribution: {
    companies: StatusDistribution[];
    plans: StatusDistribution[];
  };
  topCompanies: TopCompany[];
  companies: AdminCompany[];
}

export function ContentDashboard({
  stats,
  timeSeries,
  statusDistribution,
  topCompanies,
  companies,
}: ContentDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Treści</h1>
        <p className="text-muted-foreground">
          Zarządzaj firmami, planami kont i FAQ w systemie FundedRank.
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
            value="management"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Zarządzanie</span>
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
          <ContentOverviewTab
            stats={stats}
            timeSeries={timeSeries}
            statusDistribution={statusDistribution}
            topCompanies={topCompanies}
          />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <ContentManagementTab companies={companies} />
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <ContentOperationsTab />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <ContentHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

