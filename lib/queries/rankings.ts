import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { convertCurrency, FALLBACK_RATES } from "@/lib/currency";
import type {
  RankingCategoryScores,
  RankingCompanySnapshot,
  RankingFilters,
  RankingMaxValues,
  RankingScores,
  RankingsDataset,
} from "@/lib/types/rankings";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type PrismaDecimal = {
  toNumber(): number;
};

interface RawRankingCompany {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  country: string | null;
  foundedYear: number | null;
  headline: string | null;
  rating: number | null;
  reviewCount: number;
  averageRating: number | null;
  recommendedRatio: number | null;
  favoritesCount: number;
  newReviews30d: number;
  clicks30d: number;
  clicksPrev30d: number;
  trendRatio: number;
  cashbackAveragePoints: number | null;
  cashbackRedeemRate: number | null;
  cashbackPayoutHours: number | null;
  hasCashback: boolean;
  evaluationModels: string[];
  accountTypes: string[];
  maxProfitSplit: number | null;
  categoryScores: RankingCategoryScores;
  discountCode: string | null;
  cashbackRate: number | null;
  maxPlanPrice: number | null;
}

const REVIEW_CATEGORY_KEYS = [
  "tradingConditions",
  "customerSupport",
  "userExperience",
  "payoutExperience",
] as const;

type ReviewCategoryKey = (typeof REVIEW_CATEGORY_KEYS)[number];

// Internal implementation without caching
async function getRankingsDatasetImpl(
  filters: RankingFilters = {},
): Promise<RankingsDataset> {
  const now = new Date();
  const recentBoundary = new Date(now.getTime() - THIRTY_DAYS_MS);
  const previousBoundary = new Date(recentBoundary.getTime() - THIRTY_DAYS_MS);

  const companyRecords = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      country: true,
      foundedYear: true,
      headline: true,
      rating: true,
      cashbackRate: true,
      discountCode: true,
      reviews: {
        where: { status: "APPROVED" },
        select: {
          rating: true,
          metadata: true,
          createdAt: true,
          publishedAt: true,
        },
      },
      plans: {
        select: {
          evaluationModel: true,
          accountType: true,
          profitSplit: true,
          price: true,
          currency: true,
        },
      },
      transactions: {
        select: {
          status: true,
          points: true,
          approvedAt: true,
          fulfilledAt: true,
        },
      },
      clicks: {
        where: {
          clickedAt: {
            gte: previousBoundary,
          },
        },
        select: {
          clickedAt: true,
        },
      },
      _count: {
        select: {
          favorites: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const rawCompanies: RawRankingCompany[] = companyRecords.map((company) => {
    const reviews = company.reviews;
    const reviewCount = reviews.length;
    const totalRating = reviews.reduce(
      (sum, review) => sum + Number(review.rating),
      0,
    );
    let recommendedCount = 0;
    let newReviews30d = 0;

    const categoryTotals: Record<ReviewCategoryKey, number> = {
      tradingConditions: 0,
      customerSupport: 0,
      userExperience: 0,
      payoutExperience: 0,
    };
    const categoryCounts: Record<ReviewCategoryKey, number> = {
      tradingConditions: 0,
      customerSupport: 0,
      userExperience: 0,
      payoutExperience: 0,
    };

    reviews.forEach((review) => {
      const baseDate = review.publishedAt ?? review.createdAt;
      if (baseDate >= recentBoundary) {
        newReviews30d += 1;
      }

      const metadata = extractReviewMetadata(review.metadata);
      if (metadata.recommended === true) {
        recommendedCount += 1;
      }

      const categoryScores = extractReviewCategoryScores(review.metadata);
      REVIEW_CATEGORY_KEYS.forEach((key) => {
        const value = categoryScores[key];
        if (typeof value === "number" && Number.isFinite(value)) {
          categoryTotals[key] += value;
          categoryCounts[key] += 1;
        }
      });
    });

    const averageRating =
      reviewCount > 0 ? totalRating / reviewCount : toOptionalNumber(company.rating);
    const recommendedRatio =
      reviewCount > 0 ? recommendedCount / reviewCount : null;

    const categoryScores: RankingCategoryScores = {
      tradingConditions: computeCategoryAverage(
        "tradingConditions",
        categoryTotals,
        categoryCounts,
        averageRating,
      ),
      customerSupport: computeCategoryAverage(
        "customerSupport",
        categoryTotals,
        categoryCounts,
        averageRating,
      ),
      userExperience: computeCategoryAverage(
        "userExperience",
        categoryTotals,
        categoryCounts,
        averageRating,
      ),
      payoutExperience: computeCategoryAverage(
        "payoutExperience",
        categoryTotals,
        categoryCounts,
        averageRating,
      ),
    };

    const clicks = company.clicks;
    let clicks30d = 0;
    let clicksPrev30d = 0;
    clicks.forEach((click) => {
      if (click.clickedAt >= recentBoundary) {
        clicks30d += 1;
      } else {
        clicksPrev30d += 1;
      }
    });

    const cashbackTransactions = company.transactions ?? [];
    let cashbackAveragePoints: number | null = null;
    let cashbackRedeemRate: number | null = null;
    let cashbackPayoutHours: number | null = null;

    if (cashbackTransactions.length > 0) {
      const totalPoints = cashbackTransactions.reduce(
        (sum, transaction) => sum + (transaction.points ?? 0),
        0,
      );

      cashbackAveragePoints =
        cashbackTransactions.length > 0
          ? totalPoints / cashbackTransactions.length
          : null;

      const redeemedCount = cashbackTransactions.filter(
        (transaction) => transaction.status === "REDEEMED",
      ).length;
      cashbackRedeemRate =
        cashbackTransactions.length > 0
          ? redeemedCount / cashbackTransactions.length
          : null;

      const payoutDurations: number[] = [];
      cashbackTransactions.forEach((transaction) => {
        if (transaction.approvedAt && transaction.fulfilledAt) {
          const diff =
            transaction.fulfilledAt.getTime() - transaction.approvedAt.getTime();
          if (diff > 0) {
            payoutDurations.push(diff / (1000 * 60 * 60));
          }
        }
      });

      if (payoutDurations.length > 0) {
        cashbackPayoutHours =
          payoutDurations.reduce((sum, value) => sum + value, 0) /
          payoutDurations.length;
      }
    }

    const evaluationModels = Array.from(
      new Set(
        company.plans
          .map((plan) => plan.evaluationModel)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const accountTypes = Array.from(
      new Set(
        company.plans
          .map((plan) => plan.accountType)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const profitSplits = company.plans
      .map((plan) => extractProfitSplit(plan.profitSplit))
      .filter((value): value is number => value !== null);
    const maxProfitSplit =
      profitSplits.length > 0 ? Math.max(...profitSplits) : null;

    // Calculate max plan price in USD
    let maxPlanPrice: number | null = null;
    if (company.plans.length > 0) {
      const pricesInUsd = company.plans.map((plan) => {
        const price = typeof plan.price === "object" && "toNumber" in plan.price
          ? (plan.price as PrismaDecimal).toNumber()
          : typeof plan.price === "number"
            ? plan.price
            : 0;
        const currency = plan.currency ?? "USD";
        return convertCurrency(price, currency, "USD", FALLBACK_RATES);
      });
      maxPlanPrice = pricesInUsd.length > 0 ? Math.max(...pricesInUsd) : null;
    }

    const cashbackRate = typeof company.cashbackRate === "number" && company.cashbackRate > 0
      ? company.cashbackRate
      : null;

    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logoUrl: company.logoUrl ?? null,
      country: company.country ?? null,
      foundedYear: company.foundedYear ?? null,
      headline: company.headline ?? null,
      rating: toOptionalNumber(company.rating),
      reviewCount,
      averageRating,
      recommendedRatio,
      favoritesCount: company._count.favorites,
      newReviews30d,
      clicks30d,
      clicksPrev30d,
      trendRatio: computeTrendRatio(clicks30d, clicksPrev30d),
      cashbackAveragePoints,
      cashbackRedeemRate,
      cashbackPayoutHours,
      hasCashback:
        cashbackTransactions.length > 0 ||
        typeof company.cashbackRate === "number",
      evaluationModels,
      accountTypes,
      maxProfitSplit,
      categoryScores,
      discountCode: company.discountCode ?? null,
      cashbackRate,
      maxPlanPrice,
    };
  });

  const totalCompanies = rawCompanies.length;

  const maxValuesGlobal: RankingMaxValues = {
    reviewCount: getMax(rawCompanies.map((company) => company.reviewCount)),
    favoritesCount: getMax(rawCompanies.map((company) => company.favoritesCount)),
    newReviews30d: getMax(rawCompanies.map((company) => company.newReviews30d)),
    clicks30d: getMax(rawCompanies.map((company) => company.clicks30d)),
    cashbackAveragePoints: getMax(
      rawCompanies
        .map((company) => company.cashbackAveragePoints ?? 0)
        .filter((value) => value > 0),
    ),
  };

  const snapshotWithScores: RankingCompanySnapshot[] = rawCompanies.map(
    (company) => ({
      ...company,
      scores: computeScores(company, maxValuesGlobal),
    }),
  );

  // Zapisz score do historii dla wszystkich firm (równolegle)
  // Używamy Promise.allSettled, aby błędy zapisu nie przerywały głównego flow
  await Promise.allSettled(
    snapshotWithScores.map((company) =>
      recordCompanyRankingScore(company.id, company.scores.overall).catch((error) => {
        console.error(`Failed to record ranking history for company ${company.id}:`, error);
        return null; // Continue even if one fails
      }),
    ),
  );

  const filteredCompanies = snapshotWithScores.filter((company) =>
    matchesFilters(company, filters),
  );

  const maxValuesFiltered: RankingMaxValues = {
    reviewCount: getMax(filteredCompanies.map((company) => company.reviewCount)),
    favoritesCount: getMax(
      filteredCompanies.map((company) => company.favoritesCount),
    ),
    newReviews30d: getMax(
      filteredCompanies.map((company) => company.newReviews30d),
    ),
    clicks30d: getMax(filteredCompanies.map((company) => company.clicks30d)),
    cashbackAveragePoints: getMax(
      filteredCompanies
        .map((company) => company.cashbackAveragePoints ?? 0)
        .filter((value) => value > 0),
    ),
  };

  const availableCountries = Array.from(
    new Set(
      snapshotWithScores
        .map((company) => company.country)
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const availableEvaluationModels = Array.from(
    new Set(snapshotWithScores.flatMap((company) => company.evaluationModels)),
  ).sort((a, b) => a.localeCompare(b));

  const availableAccountTypes = Array.from(
    new Set(snapshotWithScores.flatMap((company) => company.accountTypes)),
  ).sort((a, b) => a.localeCompare(b));

  return {
    generatedAt: now.toISOString(),
    totalCompanies,
    filteredCompanies: filteredCompanies.length,
    companies: filteredCompanies,
    maxValues: maxValuesFiltered,
    availableCountries,
    availableEvaluationModels,
    availableAccountTypes,
  };
}

function getMax(values: number[]): number {
  if (!values.length) {
    return 0;
  }
  return values.reduce((max, value) => (value > max ? value : max), 0);
}

function toOptionalNumber(value: PrismaDecimal | number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "object" && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
}

function extractReviewMetadata(metadata: unknown): {
  recommended: boolean | null;
} {
  if (!metadata || typeof metadata !== "object") {
    return { recommended: null };
  }

  const record = metadata as Record<string, unknown>;
  const recommended =
    typeof record.recommended === "boolean"
      ? record.recommended
      : typeof record.recommended === "string"
        ? record.recommended.toLowerCase() === "true"
        : null;

  return { recommended };
}

function extractReviewCategoryScores(
  metadata: unknown,
): Partial<Record<ReviewCategoryKey, number>> {
  if (!metadata || typeof metadata !== "object") {
    return {};
  }

  const record = metadata as Record<string, unknown>;
  const rawScores = (record.scores ??
    record.ratingBreakdown ??
    record.categories) as Record<string, unknown> | undefined;

  const lookupSources: Record<ReviewCategoryKey, string[]> = {
    tradingConditions: [
      "tradingConditions",
      "conditions",
      "trading",
      "environment",
    ],
    customerSupport: ["customerSupport", "customerCare", "support"],
    userExperience: [
      "userExperience",
      "userFriendliness",
      "platform",
      "experience",
    ],
    payoutExperience: ["payoutExperience", "payoutProcess", "payouts"],
  };

  const result: Partial<Record<ReviewCategoryKey, number>> = {};

  REVIEW_CATEGORY_KEYS.forEach((key) => {
    const direct = extractScoreValue(record, lookupSources[key]);
    if (direct !== null) {
      result[key] = direct;
      return;
    }

    if (rawScores && typeof rawScores === "object") {
      const nested = extractScoreValue(
        rawScores as Record<string, unknown>,
        lookupSources[key],
      );
      if (nested !== null) {
        result[key] = nested;
      }
    }
  });

  return result;
}

function extractScoreValue(
  source: Record<string, unknown>,
  candidateKeys: string[],
): number | null {
  for (const key of candidateKeys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (
      typeof value === "string" &&
      value.trim().length > 0 &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }
  return null;
}

function computeCategoryAverage(
  key: ReviewCategoryKey,
  totals: Record<ReviewCategoryKey, number>,
  counts: Record<ReviewCategoryKey, number>,
  fallback: number | null,
): number | null {
  if (counts[key] > 0) {
    const avg = totals[key] / counts[key];
    return Number.isFinite(avg) ? avg : fallback;
  }
  return fallback;
}

function computeTrendRatio(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 1 : 0;
  }
  return (current - previous) / previous;
}

function computeScores(
  company: RawRankingCompany,
  maxValues: RankingMaxValues,
): RankingScores {
  const normalizedRating = normalizeRating(company.averageRating);
  const normalizedReviews = normalizeByMax(
    company.reviewCount,
    maxValues.reviewCount,
  );
  const normalizedFavorites = normalizeByMax(
    company.favoritesCount,
    maxValues.favoritesCount,
  );
  const normalizedRecommended =
    company.recommendedRatio !== null ? clamp01(company.recommendedRatio) : 0.5;
  const normalizedCategory = (value: number | null) =>
    value !== null ? clamp01(value / 5) : normalizedRating;

  const trendScore = normalizeTrend(company.trendRatio);
  const newReviewsScore = normalizeByMax(
    company.newReviews30d,
    maxValues.newReviews30d,
  );
  const cashbackPointsScore = normalizeByMax(
    company.cashbackAveragePoints ?? 0,
    maxValues.cashbackAveragePoints,
  );
  const cashbackRedeemScore =
    company.cashbackRedeemRate !== null
      ? clamp01(company.cashbackRedeemRate)
      : 0;
  const cashbackPayoutScore =
    company.cashbackPayoutHours !== null
      ? 1 - clamp01(company.cashbackPayoutHours / 72)
      : 0.5;

  const overall =
    normalizedRating * 0.55 +
    normalizedReviews * 0.2 +
    normalizedFavorites * 0.1 +
    normalizedRecommended * 0.15;

  const conditions =
    normalizedCategory(company.categoryScores.tradingConditions) * 0.7 +
    normalizedCategory(company.categoryScores.userExperience) * 0.3;

  const payouts =
    normalizedCategory(company.categoryScores.payoutExperience) * 0.5 +
    cashbackRedeemScore * 0.3 +
    cashbackPayoutScore * 0.2;

  const community =
    normalizedRating * 0.5 +
    normalizedReviews * 0.25 +
    normalizedRecommended * 0.25;

  const cashback =
    (company.hasCashback ? 0.2 : 0) +
    cashbackPointsScore * 0.35 +
    cashbackRedeemScore * 0.25 +
    cashbackPayoutScore * 0.2;

  const growth =
    trendScore * 0.6 +
    newReviewsScore * 0.25 +
    normalizeByMax(company.clicks30d, maxValues.clicks30d) * 0.15;

  return {
    overall: scaleScore(overall),
    conditions: scaleScore(conditions),
    payouts: scaleScore(payouts),
    community: scaleScore(community),
    cashback: scaleScore(cashback),
    growth: scaleScore(growth),
  };
}

function normalizeRating(value: number | null): number {
  if (value === null) {
    return 0.5;
  }
  return clamp01(value / 5);
}

function normalizeByMax(value: number, max: number): number {
  if (max <= 0) {
    return 0;
  }
  return clamp01(value / max);
}

function normalizeTrend(ratio: number): number {
  if (!Number.isFinite(ratio)) {
    return 0.5;
  }
  const clamped = Math.max(-1, Math.min(1, ratio));
  return clamp01(0.5 + clamped / 2);
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

function scaleScore(value: number): number {
  return Math.round(clamp01(value) * 1000) / 10;
}

function matchesFilters(
  company: RankingCompanySnapshot,
  filters: RankingFilters,
): boolean {
  if (filters.search) {
    const query = filters.search.trim().toLowerCase();
    if (
      !company.name.toLowerCase().includes(query) &&
      !company.slug.toLowerCase().includes(query)
    ) {
      return false;
    }
  }

  if (filters.countries && filters.countries.length > 0) {
    if (!company.country || !filters.countries.includes(company.country)) {
      return false;
    }
  }

  if (filters.evaluationModels && filters.evaluationModels.length > 0) {
    const intersects = company.evaluationModels.some((model) =>
      filters.evaluationModels?.includes(model),
    );
    if (!intersects) {
      return false;
    }
  }

  if (filters.accountTypes && filters.accountTypes.length > 0) {
    const intersects = company.accountTypes.some((type) =>
      filters.accountTypes?.includes(type),
    );
    if (!intersects) {
      return false;
    }
  }

  if (typeof filters.minReviews === "number") {
    if (company.reviewCount < filters.minReviews) {
      return false;
    }
  }

  if (filters.hasCashback === true && !company.hasCashback) {
    return false;
  }

  return true;
}

function extractProfitSplit(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const match = value.match(/\d+/);
  if (!match) {
    return null;
  }

  const parsed = Number.parseInt(match[0] ?? "", 10);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Records a company's overall ranking score to history
 * Only records once per day to avoid duplicate entries
 */
export async function recordCompanyRankingScore(companyId: string, overallScore: number): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if we already have a record for today
  const existing = await prisma.companyRankingHistory.findFirst({
    where: {
      companyId,
      recordedAt: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  if (existing) {
    // Update existing record for today
    await prisma.companyRankingHistory.update({
      where: { id: existing.id },
      data: { overallScore },
    });
    return;
  }

  // Create new record
  await prisma.companyRankingHistory.create({
    data: {
      companyId,
      overallScore,
      recordedAt: new Date(),
    },
  });
}

/**
 * Gets ranking history for a company
 * Returns data points for chart visualization
 * Cached for 1 hour as ranking history changes slowly
 */
const getCachedRankingHistory = unstable_cache(
  async (companyId: string, days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const history = await prisma.companyRankingHistory.findMany({
      where: {
        companyId,
        recordedAt: {
          gte: cutoffDate,
        },
      },
      orderBy: {
        recordedAt: "asc",
      },
      select: {
        overallScore: true,
        recordedAt: true,
      },
    });

    // Convert Prisma Decimal to number
    return history.map((entry) => ({
      date: typeof entry.recordedAt === 'string' ? entry.recordedAt : entry.recordedAt.toISOString(),
      score: typeof entry.overallScore === "object" && "toNumber" in entry.overallScore
        ? (entry.overallScore as PrismaDecimal).toNumber()
        : typeof entry.overallScore === "number"
          ? entry.overallScore
          : 0,
    }));
  },
  ["company-ranking-history"],
  {
    revalidate: 3600, // 1 hour - ranking history doesn't change often
    tags: ["rankings"],
  }
);

export async function getCompanyRankingHistory(
  companyId: string,
  days: number = 90,
): Promise<Array<{ date: string; score: number }>> {
  return getCachedRankingHistory(companyId, days);
}

// Cached version of getRankingsDataset with 5 minute revalidation
// This significantly improves performance for repeated ranking page loads
export const getRankingsDataset = unstable_cache(
  async (filters: RankingFilters = {}) => getRankingsDatasetImpl(filters),
  ["rankings-dataset"],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ["rankings"],
  }
);

export {
  normalizeRating,
  normalizeByMax,
  normalizeTrend,
  clamp01,
  scaleScore,
  matchesFilters,
  extractProfitSplit,
};
