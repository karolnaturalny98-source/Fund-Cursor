import { OverviewDashboard } from "@/components/admin/overview-dashboard";
import { getShopRevenueStats } from "@/lib/queries/shop";
import { getClickAnalytics } from "@/lib/queries/analytics";
import { getAffiliateQueue } from "@/lib/queries/affiliates";
import { getRedeemQueue } from "@/lib/queries/transactions";
import { getInfluencerProfiles } from "@/lib/queries/influencers";
import { getPendingReviews } from "@/lib/queries/reviews";
import { getPendingDataIssues } from "@/lib/queries/data-issues";
import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const [
    shopStats,
    clickAnalytics,
    affiliateQueue,
    redeemQueue,
    influencerProfiles,
    pendingReviews,
    pendingIssues,
    totalStats,
  ] = await Promise.all([
    getShopRevenueStats(),
    getClickAnalytics(5),
    getAffiliateQueue(10),
    getRedeemQueue(10),
    getInfluencerProfiles(10),
    getPendingReviews(10),
    getPendingDataIssues(10),
    Promise.all([
      prisma.affiliateTransaction.count({ where: { status: "PENDING" } }),
      prisma.cashbackTransaction.count({ where: { status: "PENDING" } }),
      prisma.influencerProfile.count({ where: { status: "PENDING" } }),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.dataIssueReport.count({ where: { status: "PENDING" } }),
      prisma.disputeCase.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
    ]),
  ]);

  const [
    pendingAffiliateCount,
    pendingCashbackCount,
    pendingInfluencerCount,
    pendingReviewCount,
    pendingIssueCount,
    openDisputesCount,
  ] = totalStats;

  return (
    <OverviewDashboard
      shopStats={shopStats}
      clickAnalytics={clickAnalytics}
      pendingCounts={{
        affiliate: pendingAffiliateCount,
        cashback: pendingCashbackCount,
        influencers: pendingInfluencerCount,
        reviews: pendingReviewCount,
        issues: pendingIssueCount,
        disputes: openDisputesCount,
      }}
      recentItems={{
        affiliateQueue: affiliateQueue.slice(0, 5),
        redeemQueue: redeemQueue.slice(0, 5).map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          approvedAt: item.approvedAt ? new Date(item.approvedAt) : null,
          fulfilledAt: item.fulfilledAt ? new Date(item.fulfilledAt) : null,
        })),
        influencerProfiles: influencerProfiles.slice(0, 5),
        pendingReviews: pendingReviews.slice(0, 5),
        pendingIssues: pendingIssues.slice(0, 5),
      }}
    />
  );
}

