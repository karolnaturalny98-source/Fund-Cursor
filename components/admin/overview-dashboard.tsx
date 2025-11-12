"use client";

import { MetricCard } from "./metric-card";
import { SectionCard } from "./section-card";
import { OverviewStatsGrid } from "./overview-stats-grid";
import { OverviewActivityFeed } from "./overview-activity-feed";
import type { ShopRevenueStats } from "@/lib/queries/shop";
import type { ClickAnalyticsResult } from "@/lib/queries/analytics";
import type { AffiliateQueueItem } from "@/lib/queries/affiliates";
import type { TransactionHistoryItem } from "@/lib/queries/transactions";
import type { InfluencerProfileWithUser } from "@/lib/queries/influencers";
import type { PendingReview } from "@/lib/queries/reviews";
import type { PendingDataIssue } from "@/lib/queries/data-issues";
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface OverviewDashboardProps {
  shopStats: ShopRevenueStats;
  clickAnalytics: ClickAnalyticsResult;
  pendingCounts: {
    affiliate: number;
    cashback: number;
    influencers: number;
    reviews: number;
    issues: number;
    disputes: number;
  };
  recentItems: {
    affiliateQueue: AffiliateQueueItem[];
    redeemQueue: TransactionHistoryItem[];
    influencerProfiles: InfluencerProfileWithUser[];
    pendingReviews: PendingReview[];
    pendingIssues: PendingDataIssue[];
  };
}

export function OverviewDashboard({
  shopStats,
  clickAnalytics,
  pendingCounts,
  recentItems,
}: OverviewDashboardProps) {
  const totalPending =
    pendingCounts.affiliate +
    pendingCounts.cashback +
    pendingCounts.influencers +
    pendingCounts.reviews +
    pendingCounts.issues +
    pendingCounts.disputes;

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Revenue"
          value={`$${shopStats.revenue.toLocaleString("pl-PL", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          description="Łączny przychód ze sklepu"
          icon={DollarSign}
          variant="primary"
        />
        <MetricCard
          title="Zamówienia"
          value={shopStats.totalOrders}
          description={`${shopStats.approvedOrders} zatwierdzone, ${shopStats.pendingOrders} oczekujące`}
          icon={ShoppingBag}
          variant="default"
        />
        <MetricCard
          title="Oczekujące akcje"
          value={totalPending}
          description="Wymagają uwagi administratora"
          icon={AlertCircle}
          variant={totalPending > 0 ? "warning" : "success"}
        />
        <MetricCard
          title="Kliknięcia (30d)"
          value={clickAnalytics.summary.last30Days.toLocaleString("pl-PL")}
          description={`${clickAnalytics.summary.last7Days.toLocaleString("pl-PL")} w ostatnich 7 dniach`}
          icon={Activity}
          variant="default"
        />
      </div>

      {/* Detailed Stats Grid */}
      <OverviewStatsGrid
        shopStats={shopStats}
        pendingCounts={pendingCounts}
        clickAnalytics={clickAnalytics}
      />

      {/* Recent Activity */}
      <OverviewActivityFeed recentItems={recentItems} />

      {/* Quick Actions */}
      <SectionCard
        title="Szybkie akcje"
        description="Najczęściej używane funkcje panelu administracyjnego"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button variant="outline" asChild className="justify-start h-auto py-4">
            <Link href="/admin/cashback">
              <AlertCircle className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Kolejki cashback</div>
                <div className="text-xs text-muted-foreground">
                  {pendingCounts.affiliate + pendingCounts.cashback} oczekujących
                </div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="justify-start h-auto py-4">
            <Link href="/admin/community">
              <Users className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Moderacja społeczności</div>
                <div className="text-xs text-muted-foreground">
                  {pendingCounts.influencers + pendingCounts.reviews + pendingCounts.issues}{" "}
                  oczekujących
                </div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="justify-start h-auto py-4">
            <Link href="/admin/shop">
              <TrendingUp className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Analiza sklepu</div>
                <div className="text-xs text-muted-foreground">
                  Pełne statystyki i wykresy
                </div>
              </div>
            </Link>
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

