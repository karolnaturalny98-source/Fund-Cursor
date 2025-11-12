import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CompanyWithDetails, CompanyRankingHistory, PriceHistoryPoint } from "@/lib/types";
import { getCompanyBySlug } from "./companies";

const CACHE_TAGS = {
  analysis: "analysis",
  priceHistory: "price-history",
  ratingHistory: "rating-history",
};

const CACHE_REVALIDATE = 3600; // 1 hour

/**
 * Fetch 1-3 companies for detailed analysis
 */
export async function getCompaniesForAnalysis(slugs: string[]): Promise<CompanyWithDetails[]> {
  if (slugs.length === 0 || slugs.length > 3) {
    throw new Error("Must provide between 1 and 3 company slugs");
  }

  const companies = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const company = await getCompanyBySlug(slug);
        if (!company) {
          throw new Error(`Company not found: ${slug}`);
        }
        return company;
      } catch (error) {
        console.error(`Error fetching company ${slug}:`, error);
        throw error;
      }
    })
  );

  return companies;
}

/**
 * Get price history for multiple companies
 */
export async function getCompaniesPriceHistory(
  companyIds: string[]
): Promise<Record<string, PriceHistoryPoint[]>> {
  return unstable_cache(
    async () => {
      const result: Record<string, PriceHistoryPoint[]> = {};

      for (const companyId of companyIds) {
        const plans = await prisma.companyPlan.findMany({
          where: { companyId },
          select: {
            id: true,
            name: true,
            priceHistory: {
              select: {
                id: true,
                price: true,
                currency: true,
                recordedAt: true,
              },
              orderBy: {
                recordedAt: "asc" as Prisma.SortOrder,
              },
              take: 30,
            },
          },
        });

        const allHistory = plans.flatMap((plan) =>
          plan.priceHistory.map((h) => ({
            id: h.id,
            price: Number(h.price),
            currency: h.currency,
            recordedAt: h.recordedAt.toISOString(),
            planName: plan.name,
          }))
        );

        result[companyId] = allHistory;
      }

      return result;
    },
    [`price-history-${companyIds.join("-")}`],
    {
      revalidate: CACHE_REVALIDATE,
      tags: [CACHE_TAGS.priceHistory],
    }
  )();
}

/**
 * Get rating history for multiple companies
 */
export async function getCompaniesRatingHistory(
  companyIds: string[]
): Promise<Record<string, CompanyRankingHistory[]>> {
  return unstable_cache(
    async () => {
      const result: Record<string, CompanyRankingHistory[]> = {};

      for (const companyId of companyIds) {
        const history = await prisma.companyRankingHistory.findMany({
          where: { companyId },
          select: {
            id: true,
            companyId: true,
            overallScore: true,
            recordedAt: true,
          },
          orderBy: {
            recordedAt: "asc" as Prisma.SortOrder,
          },
          take: 60,
        });

        result[companyId] = history.map((h) => ({
          id: h.id,
          companyId: h.companyId,
          overallScore: Number(h.overallScore),
          recordedAt: h.recordedAt.toISOString(),
        }));
      }

      return result;
    },
    [`rating-history-${companyIds.join("-")}`],
    {
      revalidate: CACHE_REVALIDATE,
      tags: [CACHE_TAGS.ratingHistory],
    }
  )();
}

/**
 * Get aggregated review statistics for companies
 */
export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  verifiedCount: number;
  recommendationRate: number;
}

export async function getCompaniesReviewStatistics(
  companyIds: string[]
): Promise<Record<string, ReviewStatistics>> {
  return unstable_cache(
    async () => {
      const result: Record<string, ReviewStatistics> = {};

      for (const companyId of companyIds) {
        const reviews = await prisma.review.findMany({
          where: {
            companyId,
            status: "APPROVED",
          },
          select: {
            rating: true,
            metadata: true,
          },
        });

        const ratingDistribution: Record<number, number> = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        };

        let verifiedCount = 0;
        let recommendedCount = 0;

        reviews.forEach((review) => {
          ratingDistribution[review.rating] =
            (ratingDistribution[review.rating] || 0) + 1;

          const metadata = review.metadata as Record<string, unknown> | null;
          if (metadata?.recommended) {
            recommendedCount++;
          }
          if (metadata?.monthsWithCompany && Number(metadata.monthsWithCompany) >= 1) {
            verifiedCount++;
          }
        });

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        const recommendationRate =
          reviews.length > 0 ? (recommendedCount / reviews.length) * 100 : 0;

        result[companyId] = {
          totalReviews: reviews.length,
          averageRating,
          ratingDistribution,
          verifiedCount,
          recommendationRate,
        };
      }

      return result;
    },
    [`review-stats-${companyIds.join("-")}`],
    {
      revalidate: CACHE_REVALIDATE,
      tags: [CACHE_TAGS.analysis],
    }
  )();
}

/**
 * Get comparison metrics for companies
 */
export interface ComparisonMetrics {
  avgPlanPrice: number;
  minPlanPrice: number;
  maxPlanPrice: number;
  totalPlans: number;
  avgProfitSplit: number | null;
  avgLeverage: number | null;
  avgMaxDrawdown: number | null;
  avgProfitTarget: number | null;
}

export async function getCompaniesComparisonMetrics(
  companyIds: string[]
): Promise<Record<string, ComparisonMetrics>> {
  const result: Record<string, ComparisonMetrics> = {};

  for (const companyId of companyIds) {
    const plans = await prisma.companyPlan.findMany({
      where: { companyId },
      select: {
        price: true,
        profitSplit: true,
        leverage: true,
        maxDrawdown: true,
        profitTarget: true,
      },
    });

    const prices = plans.map((p) => Number(p.price));
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

    const profitSplits = plans
      .map((p) => p.profitSplit)
      .filter(Boolean)
      .map((s) => parseInt(s!.replace(/\D/g, "")))
      .filter((n) => !isNaN(n));

    const leverages = plans
      .map((p) => p.leverage)
      .filter((l): l is number => l !== null);

    const drawdowns = plans
      .map((p) => p.maxDrawdown)
      .filter((d): d is Prisma.Decimal => d !== null)
      .map((d) => Number(d));

    const targets = plans
      .map((p) => p.profitTarget)
      .filter((t): t is Prisma.Decimal => t !== null)
      .map((t) => Number(t));

    result[companyId] = {
      avgPlanPrice: avgPrice,
      minPlanPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPlanPrice: prices.length > 0 ? Math.max(...prices) : 0,
      totalPlans: plans.length,
      avgProfitSplit:
        profitSplits.length > 0
          ? profitSplits.reduce((a, b) => a + b, 0) / profitSplits.length
          : null,
      avgLeverage:
        leverages.length > 0
          ? leverages.reduce((a, b) => a + b, 0) / leverages.length
          : null,
      avgMaxDrawdown:
        drawdowns.length > 0
          ? drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length
          : null,
      avgProfitTarget:
        targets.length > 0
          ? targets.reduce((a, b) => a + b, 0) / targets.length
          : null,
    };
  }

  return result;
}

