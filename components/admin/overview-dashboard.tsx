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
    <div className="space-y-[clamp(1.5rem,2.3vw,2.1rem)]">
      {/* Quick Stats */}
      <div className="grid gap-[clamp(0.95rem,1.3vw,1.25rem)] sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="grid gap-[clamp(0.75rem,1.1vw,1rem)] sm:grid-cols-2 lg:grid-cols-3">
          <Button
            variant="outline"
            asChild
            className="fluid-button w-full items-start justify-start text-left"
          >
            <Link href="/admin/cashback">
              <AlertCircle className="h-[clamp(1.1rem,0.45vw+1rem,1.25rem)] w-[clamp(1.1rem,0.45vw+1rem,1.25rem)] text-primary" />
              <div className="flex flex-col gap-[clamp(0.25rem,0.4vw,0.35rem)] text-left">
                <div className="text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold leading-tight text-foreground">
                  Kolejki cashback
                </div>
                <div className="fluid-caption text-muted-foreground">
                  {pendingCounts.affiliate + pendingCounts.cashback} oczekujących
                </div>
              </div>
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="fluid-button w-full items-start justify-start text-left"
          >
            <Link href="/admin/community">
              <Users className="h-[clamp(1.1rem,0.45vw+1rem,1.25rem)] w-[clamp(1.1rem,0.45vw+1rem,1.25rem)] text-primary" />
              <div className="flex flex-col gap-[clamp(0.25rem,0.4vw,0.35rem)] text-left">
                <div className="text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold leading-tight text-foreground">
                  Moderacja społeczności
                </div>
                <div className="fluid-caption text-muted-foreground">
                  {pendingCounts.influencers + pendingCounts.reviews + pendingCounts.issues}{" "}
                  oczekujących
                </div>
              </div>
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="fluid-button w-full items-start justify-start text-left"
          >
            <Link href="/admin/shop">
              <TrendingUp className="h-[clamp(1.1rem,0.45vw+1rem,1.25rem)] w-[clamp(1.1rem,0.45vw+1rem,1.25rem)] text-primary" />
              <div className="flex flex-col gap-[clamp(0.25rem,0.4vw,0.35rem)] text-left">
                <div className="text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold leading-tight text-foreground">
                  Analiza sklepu
                </div>
                <div className="fluid-caption text-muted-foreground">
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

