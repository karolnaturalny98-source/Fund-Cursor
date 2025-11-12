"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, AlertCircle, Users, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommunityOverviewTab } from "./community-overview-tab";
import { CommunityQueuesTab } from "./community-queues-tab";
import { CommunityInfluencersTab } from "./community-influencers-tab";
import { CommunityHistoryTab } from "./community-history-tab";
import type { InfluencerProfileWithUser } from "@/lib/types";
import type { PendingReview } from "@/lib/queries/reviews";
import type { PendingDataIssue } from "@/lib/queries/data-issues";
import type {
  CommunityStats,
  CommunityTimeSeriesPoint,
  StatusDistribution,
  TopInfluencer,
} from "@/lib/queries/community-stats";
import type { Company } from "@/lib/types";

interface CommunityDashboardProps {
  stats: CommunityStats;
  timeSeries: CommunityTimeSeriesPoint[];
  statusDistribution: StatusDistribution[];
  topInfluencers: TopInfluencer[];
  influencerProfiles: InfluencerProfileWithUser[];
  approvedInfluencerProfiles: InfluencerProfileWithUser[];
  pendingReviews: PendingReview[];
  pendingIssues: PendingDataIssue[];
  companies: Array<Pick<Company, "id" | "name" | "slug">>;
}

export function CommunityDashboard({
  stats,
  timeSeries,
  statusDistribution,
  topInfluencers,
  influencerProfiles,
  approvedInfluencerProfiles,
  pendingReviews,
  pendingIssues,
  companies,
}: CommunityDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Społeczności</h1>
        <p className="text-muted-foreground">
          Zarządzaj influencerami, moderuj opinie i rozwiązuj zgłoszenia błędów danych.
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
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Przegląd</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="queues"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground hover:border-gradient hover:bg-gradient-card hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Kolejki</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="influencers"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground hover:border-gradient hover:bg-gradient-card hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Influencerzy</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground hover:border-gradient hover:bg-gradient-card hover:shadow-premium",
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
          <CommunityOverviewTab
            stats={stats}
            timeSeries={timeSeries}
            statusDistribution={statusDistribution}
            topInfluencers={topInfluencers}
          />
        </TabsContent>

        <TabsContent value="queues" className="space-y-6">
          <CommunityQueuesTab
            influencerProfiles={influencerProfiles}
            pendingReviews={pendingReviews}
            pendingIssues={pendingIssues}
          />
        </TabsContent>

        <TabsContent value="influencers" className="space-y-6">
          <CommunityInfluencersTab profiles={approvedInfluencerProfiles} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <CommunityHistoryTab companies={companies} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

