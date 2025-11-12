import { prisma } from "@/lib/prisma";

export interface CommunityStats {
  // Główne metryki
  pendingInfluencersCount: number;
  pendingReviewsCount: number;
  pendingIssuesCount: number;
  allPendingCount: number;

  // Metryki influencerów
  totalInfluencers: number;
  approvedInfluencersCount: number;
  rejectedInfluencersCount: number;
  influencerApprovalRate: number;
  influencerRejectionRate: number;
  averageAudienceSize: number;

  // Metryki opinii
  totalReviews: number;
  approvedReviewsCount: number;
  rejectedReviewsCount: number;
  reviewApprovalRate: number;
  reviewRejectionRate: number;
  averageRating: number;

  // Metryki błędów danych
  totalIssues: number;
  resolvedIssuesCount: number;
  dismissedIssuesCount: number;
  issueResolutionRate: number;

  // Metryki trendów
  influencersLast7Days: number;
  influencersLast30Days: number;
  reviewsLast7Days: number;
  reviewsLast30Days: number;
  issuesLast7Days: number;
  issuesLast30Days: number;
}

export interface CommunityTimeSeriesPoint {
  date: string;
  influencers: number;
  reviews: number;
  issues: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface TopInfluencer {
  handle: string;
  platform: string;
  audienceSize: number;
  status: string;
}

export async function getCommunityStats(): Promise<CommunityStats> {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Główne metryki
  const [
    pendingInfluencersCount,
    pendingReviewsCount,
    pendingIssuesCount,
    totalInfluencers,
    totalReviews,
    totalIssues,
  ] = await Promise.all([
    prisma.influencerProfile.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.dataIssueReport.count({ where: { status: "PENDING" } }),
    prisma.influencerProfile.count(),
    prisma.review.count(),
    prisma.dataIssueReport.count(),
  ]);

  const allPendingCount = pendingInfluencersCount + pendingReviewsCount + pendingIssuesCount;

  // Metryki influencerów
  const [
    approvedInfluencersCount,
    rejectedInfluencersCount,
    influencerAudienceSizes,
  ] = await Promise.all([
    prisma.influencerProfile.count({ where: { status: "APPROVED" } }),
    prisma.influencerProfile.count({ where: { status: "REJECTED" } }),
    prisma.influencerProfile.findMany({
      where: { audienceSize: { not: null } },
      select: { audienceSize: true },
    }),
  ]);

  const influencerApprovalRate =
    totalInfluencers > 0
      ? (approvedInfluencersCount / totalInfluencers) * 100
      : 0;
  const influencerRejectionRate =
    totalInfluencers > 0
      ? (rejectedInfluencersCount / totalInfluencers) * 100
      : 0;

  const averageAudienceSize =
    influencerAudienceSizes.length > 0
      ? influencerAudienceSizes.reduce(
          (sum, profile) => sum + (profile.audienceSize ?? 0),
          0
        ) / influencerAudienceSizes.length
      : 0;

  // Metryki opinii
  const [approvedReviewsCount, rejectedReviewsCount, reviewRatings] =
    await Promise.all([
      prisma.review.count({ where: { status: "APPROVED" } }),
      prisma.review.count({ where: { status: "REJECTED" } }),
      prisma.review.findMany({
        select: { rating: true },
      }),
    ]);

  const reviewApprovalRate =
    totalReviews > 0 ? (approvedReviewsCount / totalReviews) * 100 : 0;
  const reviewRejectionRate =
    totalReviews > 0 ? (rejectedReviewsCount / totalReviews) * 100 : 0;

  const averageRating =
    reviewRatings.length > 0
      ? reviewRatings.reduce((sum, review) => sum + review.rating, 0) /
        reviewRatings.length
      : 0;

  // Metryki błędów danych
  const [resolvedIssuesCount, dismissedIssuesCount] = await Promise.all([
    prisma.dataIssueReport.count({ where: { status: "RESOLVED" } }),
    prisma.dataIssueReport.count({ where: { status: "DISMISSED" } }),
  ]);

  const issueResolutionRate =
    totalIssues > 0 ? (resolvedIssuesCount / totalIssues) * 100 : 0;

  // Metryki trendów
  const [
    influencersLast7Days,
    influencersLast30Days,
    reviewsLast7Days,
    reviewsLast30Days,
    issuesLast7Days,
    issuesLast30Days,
  ] = await Promise.all([
    prisma.influencerProfile.count({
      where: { createdAt: { gte: last7Days } },
    }),
    prisma.influencerProfile.count({
      where: { createdAt: { gte: last30Days } },
    }),
    prisma.review.count({
      where: { createdAt: { gte: last7Days } },
    }),
    prisma.review.count({
      where: { createdAt: { gte: last30Days } },
    }),
    prisma.dataIssueReport.count({
      where: { createdAt: { gte: last7Days } },
    }),
    prisma.dataIssueReport.count({
      where: { createdAt: { gte: last30Days } },
    }),
  ]);

  return {
    pendingInfluencersCount,
    pendingReviewsCount,
    pendingIssuesCount,
    allPendingCount,
    totalInfluencers,
    approvedInfluencersCount,
    rejectedInfluencersCount,
    influencerApprovalRate,
    influencerRejectionRate,
    averageAudienceSize,
    totalReviews,
    approvedReviewsCount,
    rejectedReviewsCount,
    reviewApprovalRate,
    reviewRejectionRate,
    averageRating,
    totalIssues,
    resolvedIssuesCount,
    dismissedIssuesCount,
    issueResolutionRate,
    influencersLast7Days,
    influencersLast30Days,
    reviewsLast7Days,
    reviewsLast30Days,
    issuesLast7Days,
    issuesLast30Days,
  };
}

export async function getCommunityTimeSeries(
  days = 30
): Promise<CommunityTimeSeriesPoint[]> {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  startDate.setHours(0, 0, 0, 0);

  const [influencers, reviews, issues] = await Promise.all([
    prisma.influencerProfile.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.review.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.dataIssueReport.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Grupuj po dniach
  const dailyMap = new Map<
    string,
    { influencers: number; reviews: number; issues: number }
  >();

  influencers.forEach((item) => {
    const date = new Date(item.createdAt).toISOString().split("T")[0];
    const existing = dailyMap.get(date) || { influencers: 0, reviews: 0, issues: 0 };
    dailyMap.set(date, {
      ...existing,
      influencers: existing.influencers + 1,
    });
  });

  reviews.forEach((item) => {
    const date = new Date(item.createdAt).toISOString().split("T")[0];
    const existing = dailyMap.get(date) || { influencers: 0, reviews: 0, issues: 0 };
    dailyMap.set(date, {
      ...existing,
      reviews: existing.reviews + 1,
    });
  });

  issues.forEach((item) => {
    const date = new Date(item.createdAt).toISOString().split("T")[0];
    const existing = dailyMap.get(date) || { influencers: 0, reviews: 0, issues: 0 };
    dailyMap.set(date, {
      ...existing,
      issues: existing.issues + 1,
    });
  });

  // Wypełnij wszystkie dni w zakresie
  const result: CommunityTimeSeriesPoint[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const data = dailyMap.get(dateStr) || { influencers: 0, reviews: 0, issues: 0 };
    result.push({
      date: dateStr,
      influencers: data.influencers,
      reviews: data.reviews,
      issues: data.issues,
    });
  }

  return result;
}

export async function getCommunityStatusDistribution(): Promise<
  StatusDistribution[]
> {
  // Rozkład statusów influencerów
  const [
    influencerPending,
    influencerApproved,
    influencerRejected,
    reviewPending,
    reviewApproved,
    reviewRejected,
    issuePending,
    issueResolved,
    issueDismissed,
  ] = await Promise.all([
    prisma.influencerProfile.count({ where: { status: "PENDING" } }),
    prisma.influencerProfile.count({ where: { status: "APPROVED" } }),
    prisma.influencerProfile.count({ where: { status: "REJECTED" } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.review.count({ where: { status: "REJECTED" } }),
    prisma.dataIssueReport.count({ where: { status: "PENDING" } }),
    prisma.dataIssueReport.count({ where: { status: "RESOLVED" } }),
    prisma.dataIssueReport.count({ where: { status: "DISMISSED" } }),
  ]);

  const total =
    influencerPending +
    influencerApproved +
    influencerRejected +
    reviewPending +
    reviewApproved +
    reviewRejected +
    issuePending +
    issueResolved +
    issueDismissed;

  return [
    {
      status: "Influencer PENDING",
      count: influencerPending,
      percentage: total > 0 ? (influencerPending / total) * 100 : 0,
    },
    {
      status: "Influencer APPROVED",
      count: influencerApproved,
      percentage: total > 0 ? (influencerApproved / total) * 100 : 0,
    },
    {
      status: "Influencer REJECTED",
      count: influencerRejected,
      percentage: total > 0 ? (influencerRejected / total) * 100 : 0,
    },
    {
      status: "Review PENDING",
      count: reviewPending,
      percentage: total > 0 ? (reviewPending / total) * 100 : 0,
    },
    {
      status: "Review APPROVED",
      count: reviewApproved,
      percentage: total > 0 ? (reviewApproved / total) * 100 : 0,
    },
    {
      status: "Review REJECTED",
      count: reviewRejected,
      percentage: total > 0 ? (reviewRejected / total) * 100 : 0,
    },
    {
      status: "Issue PENDING",
      count: issuePending,
      percentage: total > 0 ? (issuePending / total) * 100 : 0,
    },
    {
      status: "Issue RESOLVED",
      count: issueResolved,
      percentage: total > 0 ? (issueResolved / total) * 100 : 0,
    },
    {
      status: "Issue DISMISSED",
      count: issueDismissed,
      percentage: total > 0 ? (issueDismissed / total) * 100 : 0,
    },
  ];
}

export async function getTopInfluencers(
  limit = 5
): Promise<TopInfluencer[]> {
  const influencers = await prisma.influencerProfile.findMany({
    where: {
      audienceSize: { not: null },
    },
    orderBy: {
      audienceSize: "desc",
    },
    take: limit,
    select: {
      handle: true,
      platform: true,
      audienceSize: true,
      status: true,
    },
  });

  return influencers.map((influencer) => ({
    handle: influencer.handle,
    platform: influencer.platform,
    audienceSize: influencer.audienceSize ?? 0,
    status: influencer.status,
  }));
}

