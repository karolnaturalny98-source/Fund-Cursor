import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { convertCurrency, FALLBACK_RATES } from "@/lib/currency";
import type { ReviewExperienceLevel, ReviewHighlight } from "@/lib/types";

const prismaConfigured = Boolean(process.env.DATABASE_URL);

type PrismaDecimal = {
  toNumber(): number;
};

function shouldReturnFallback(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  );
}

export interface PendingReview {
  id: string;
  rating: number;
  status: string;
  body: string | null;
  pros: string[];
  cons: string[];
  createdAt: Date;
  experienceLevel: string | null;
  tradingStyle: string | null;
  timeframe: string | null;
  monthsWithCompany: number | null;
  accountSize: string | null;
  recommended: boolean | null;
  influencerDisclosure: string | null;
  resourceLinks: string[];
  company: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    clerkId: string;
    displayName: string | null;
  } | null;
}

export async function getPendingReviews(limit = 20): Promise<PendingReview[]> {
  if (!prismaConfigured) {
    return [];
  }
  try {
    const reviews = await prisma.review.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
      select: {
        id: true,
        rating: true,
        status: true,
        body: true,
        pros: true,
        cons: true,
        createdAt: true,
        metadata: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            clerkId: true,
            displayName: true,
          },
        },
      },
    });

    return reviews.map((review) => {
      const metadata = extractReviewMetadata(review.metadata);
      return {
      id: review.id,
      rating: review.rating,
      status: review.status,
      body: review.body ?? null,
      pros: review.pros ?? [],
      cons: review.cons ?? [],
      createdAt: review.createdAt,
        experienceLevel: metadata.experienceLevel ?? null,
        tradingStyle: metadata.tradingStyle ?? null,
        timeframe: metadata.timeframe ?? null,
        monthsWithCompany: metadata.monthsWithCompany ?? null,
        accountSize: metadata.accountSize ?? null,
        recommended: metadata.recommended ?? null,
        influencerDisclosure: metadata.influencerDisclosure ?? null,
        resourceLinks: metadata.resourceLinks ?? [],
        company: review.company
          ? {
        id: review.company.id,
        name: review.company.name,
        slug: review.company.slug,
            }
          : { id: "", name: "", slug: "" },
      user: review.user
        ? {
            id: review.user.id,
            clerkId: review.user.clerkId,
            displayName: review.user.displayName ?? null,
          }
        : null,
      };
    });
  } catch (error) {
    if (shouldReturnFallback(error)) {
      console.warn("[reviews] prisma unavailable, returning fallback pending reviews");
      return [];
    }
    throw error;
  }
}

export async function getRecentPublicReviews(
  limit = 6,
): Promise<ReviewHighlight[]> {
  if (!prismaConfigured) {
    return [];
  }
  try {
    const reviews = await prisma.review.findMany({
      where: {
        status: "APPROVED",
        publishedAt: {
          not: null,
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
      include: {
        company: {
          select: {
            id: true,
            logoUrl: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            clerkId: true,
            displayName: true,
          },
        },
      },
    });

    return reviews
      .filter((review) => review.company)
      .map((review) => ({
        id: review.id,
        rating: review.rating,
        pros: review.pros ?? [],
        cons: review.cons ?? [],
        body: review.body ?? null,
        createdAt: review.createdAt.toISOString(),
        publishedAt: review.publishedAt?.toISOString() ?? null,
        ...normalizeMetadata(review.metadata),
        user: review.user
          ? {
              id: review.user.id,
              clerkId: review.user.clerkId,
              displayName: review.user.displayName ?? null,
            }
          : null,
        company: {
          id: review.company!.id,
          name: review.company!.name,
          slug: review.company!.slug,
          logoUrl: review.company!.logoUrl ?? null,
        },
      }));
  } catch (error) {
    if (shouldReturnFallback(error)) {
      console.warn("[reviews] prisma unavailable, returning fallback public reviews");
      return [];
    }
    throw error;
  }
}

const REVIEW_EXPERIENCE_LEVELS: Set<ReviewExperienceLevel> = new Set([
  "beginner",
  "intermediate",
  "advanced",
  "expert",
  "professional",
]);

interface NormalizedMetadata {
  experienceLevel: ReviewExperienceLevel | null;
  tradingStyle: string | null;
  timeframe: string | null;
  monthsWithCompany: number | null;
  accountSize: string | null;
  recommended: boolean | null;
  influencerDisclosure: string | null;
  resourceLinks: string[];
}

function normalizeMetadata(metadata: unknown): NormalizedMetadata {
  if (!metadata || typeof metadata !== "object") {
    return {
      experienceLevel: null,
      tradingStyle: null,
      timeframe: null,
      monthsWithCompany: null,
      accountSize: null,
      recommended: null,
      influencerDisclosure: null,
      resourceLinks: [],
    };
  }

  const record = metadata as Record<string, unknown>;

  const experienceLevel =
    typeof record.experienceLevel === "string" &&
    REVIEW_EXPERIENCE_LEVELS.has(record.experienceLevel as ReviewExperienceLevel)
      ? (record.experienceLevel as ReviewExperienceLevel)
      : null;

  const tradingStyle =
    typeof record.tradingStyle === "string" && record.tradingStyle.trim().length
      ? record.tradingStyle.trim()
      : null;

  const timeframe =
    typeof record.timeframe === "string" && record.timeframe.trim().length
      ? record.timeframe.trim()
      : null;

  const monthsWithCompany = Number.isInteger(record.monthsWithCompany)
    ? (record.monthsWithCompany as number)
    : null;

  const accountSize =
    typeof record.accountSize === "string" && record.accountSize.trim().length
      ? record.accountSize.trim()
      : null;

  const recommended =
    typeof record.recommended === "boolean" ? record.recommended : null;

  const influencerDisclosure =
    typeof record.influencerDisclosure === "string" &&
    record.influencerDisclosure.trim().length
      ? record.influencerDisclosure.trim()
      : null;

  const resourceLinks = Array.isArray(record.resourceLinks)
    ? (record.resourceLinks.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      ) as string[]).slice(0, 3)
    : [];

  return {
    experienceLevel,
    tradingStyle,
    timeframe,
    monthsWithCompany,
    accountSize,
    recommended,
    influencerDisclosure,
    resourceLinks,
  };
}

function extractReviewMetadata(metadata: unknown): NormalizedMetadata {
  return normalizeMetadata(metadata);
}

const REVIEW_CATEGORY_KEYS = [
  "tradingConditions",
  "customerSupport",
  "userExperience",
  "payoutExperience",
] as const;

type ReviewCategoryKey = (typeof REVIEW_CATEGORY_KEYS)[number];

export interface ReviewsRankingOptions {
  search?: string;
  minReviews?: number;
  onlyRecent?: boolean;
  sortBy?: "rating" | "reviews" | "trend" | "favorites";
  sortDirection?: "asc" | "desc";
}

export interface ReviewCategorySummary {
  tradingConditions: number | null;
  customerSupport: number | null;
  userExperience: number | null;
  payoutExperience: number | null;
}

export interface ReviewsRankingItem {
  companyId: string;
  companyName: string;
  companySlug: string;
  logoUrl: string | null;
  favoritesCount: number;
  totalReviews: number;
  averageRating: number | null;
  newReviews30d: number;
  previousReviews30d: number;
  trendRatio: number;
  categories: ReviewCategorySummary;
  discountCode: string | null;
  cashbackRate: number | null;
  maxPlanPrice: number | null;
}

export interface ReviewsRankingSummary {
  totalCompanies: number;
  totalReviews: number;
  newReviews30d: number;
  averageRating: number | null;
}

export interface ReviewsRankingResult {
  items: ReviewsRankingItem[];
  summary: ReviewsRankingSummary;
  filteredSummary: ReviewsRankingSummary;
  maxReviewsCount: number;
  maxNewReviews30d: number;
}

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReviewHistoryParams {
  status?: ReviewStatus | "ALL";
  startDate?: Date;
  endDate?: Date;
  companyId?: string;
  minRating?: number;
  maxRating?: number;
  searchQuery?: string;
  cursor?: string;
  take?: number;
}

export interface ReviewHistoryItem {
  id: string;
  rating: number;
  status: ReviewStatus;
  body: string | null;
  pros: string[];
  cons: string[];
  createdAt: Date;
  publishedAt: Date | null;
  company: {
    id: string;
    name: string;
    slug: string;
  } | null;
  user: {
    clerkId: string;
    displayName: string | null;
    email: string | null;
  } | null;
}

export interface ReviewHistoryResponse {
  items: ReviewHistoryItem[];
  nextCursor: string | null;
}

export async function getAllReviewsHistory(
  params: ReviewHistoryParams,
): Promise<ReviewHistoryResponse> {
  if (!prismaConfigured) {
    return { items: [], nextCursor: null };
  }

  const {
    status = "ALL",
    startDate,
    endDate,
    companyId,
    minRating,
    maxRating,
    searchQuery,
    cursor,
    take = 20,
  } = params;

  const limit = Math.max(1, Math.min(take, 100));
  const where: Prisma.ReviewWhereInput = {};

  // Filter by status
  if (status !== "ALL") {
    where.status = status;
  }

  // Filter by date range
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  // Filter by company
  if (companyId) {
    where.companyId = companyId;
  }

  // Filter by rating range
  if (minRating !== undefined || maxRating !== undefined) {
    where.rating = {};
    if (minRating !== undefined) {
      where.rating.gte = minRating;
    }
    if (maxRating !== undefined) {
      where.rating.lte = maxRating;
    }
  }

  // Search filter
  if (searchQuery) {
    const search = searchQuery.trim();
    if (search.length > 0) {
      where.OR = [
        { body: { contains: search, mode: "insensitive" } },
        {
          company: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          user: {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { displayName: { contains: search, mode: "insensitive" } },
              { clerkId: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }
  }

  try {
    const records = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            clerkId: true,
            displayName: true,
            email: true,
          },
        },
      },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : undefined,
      take: limit + 1,
    });

    const hasMore = records.length > limit;
    const items = hasMore ? records.slice(0, limit) : records;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return {
      items: items.map((review) => ({
        id: review.id,
        rating: review.rating,
        status: review.status as ReviewStatus,
        body: review.body,
        pros: review.pros ?? [],
        cons: review.cons ?? [],
        createdAt: review.createdAt,
        publishedAt: review.publishedAt,
        company: review.company
          ? {
              id: review.company.id,
              name: review.company.name,
              slug: review.company.slug,
            }
          : null,
        user: review.user
          ? {
              clerkId: review.user.clerkId,
              displayName: review.user.displayName,
              email: review.user.email,
            }
          : null,
      })),
      nextCursor,
    };
  } catch (error) {
    if (shouldReturnFallback(error)) {
      console.warn("[reviews] prisma unavailable, returning fallback review history");
      return { items: [], nextCursor: null };
    }
    throw error;
  }
}

export async function getReviewsRanking(
  options: ReviewsRankingOptions = {},
): Promise<ReviewsRankingResult> {
  if (!prismaConfigured) {
    const emptySummary: ReviewsRankingSummary = {
      totalCompanies: 0,
      totalReviews: 0,
      newReviews30d: 0,
      averageRating: null,
    };
    return {
      items: [],
      summary: emptySummary,
      filteredSummary: emptySummary,
      maxReviewsCount: 0,
      maxNewReviews30d: 0,
    };
  }
  const {
    search,
    minReviews,
    onlyRecent = false,
    sortBy = "rating",
    sortDirection = "desc",
  } = options;

  const now = new Date();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const recentBoundary = new Date(now.getTime() - thirtyDaysMs);
  const previousBoundary = new Date(recentBoundary.getTime() - thirtyDaysMs);

  const companies = await prisma.company.findMany({
    where: {
      reviews: {
        some: {
          status: "APPROVED",
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      rating: true,
      discountCode: true,
      cashbackRate: true,
      plans: {
        select: {
          price: true,
          currency: true,
        },
      },
      reviews: {
        where: {
          status: "APPROVED",
        },
        select: {
          rating: true,
          metadata: true,
          createdAt: true,
          publishedAt: true,
        },
      },
      _count: {
        select: {
          favorites: true,
        },
      },
    },
  });

  const rawItems = companies.map<ReviewsRankingItem>((company) => {
    const reviews = company.reviews;
    const totalReviews = reviews.length;

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

    let sumRatings = 0;
    let newReviews30d = 0;
    let previousReviews30d = 0;

    reviews.forEach((review) => {
      const baseDate = review.publishedAt ?? review.createdAt;
      if (baseDate >= recentBoundary) {
        newReviews30d += 1;
      } else if (baseDate >= previousBoundary) {
        previousReviews30d += 1;
      }

      sumRatings += review.rating;

      const scores = extractReviewCategoryScores(review.metadata);
      REVIEW_CATEGORY_KEYS.forEach((key) => {
        const value = scores[key];
        if (typeof value === "number" && Number.isFinite(value)) {
          categoryTotals[key] += value;
          categoryCounts[key] += 1;
        }
      });
    });

    const averageRating =
      totalReviews > 0 ? Number(sumRatings / totalReviews) : null;

    const categories: ReviewCategorySummary = {
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

    const trendRatio =
      previousReviews30d === 0
        ? newReviews30d > 0
          ? 1
          : 0
        : (newReviews30d - previousReviews30d) / previousReviews30d;

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
      companyId: company.id,
      companyName: company.name,
      companySlug: company.slug,
      logoUrl: company.logoUrl ?? null,
      favoritesCount: company._count.favorites,
      totalReviews,
      averageRating,
      newReviews30d,
      previousReviews30d,
      trendRatio,
      categories,
      discountCode: company.discountCode ?? null,
      cashbackRate,
      maxPlanPrice,
    };
  });

  const summary = summarizeRanking(rawItems);

  let filtered = rawItems;

  if (typeof search === "string" && search.trim().length > 0) {
    const query = search.trim().toLowerCase();
    filtered = filtered.filter((item) => {
      return (
        item.companyName.toLowerCase().includes(query) ||
        item.companySlug.toLowerCase().includes(query)
      );
    });
  }

  if (typeof minReviews === "number" && Number.isFinite(minReviews)) {
    const threshold = Math.max(0, Math.floor(minReviews));
    filtered = filtered.filter((item) => item.totalReviews >= threshold);
  }

  if (onlyRecent) {
    filtered = filtered.filter((item) => item.newReviews30d > 0);
  }

  const sorted = [...filtered].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;

    const valueA = getSortValue(a, sortBy);
    const valueB = getSortValue(b, sortBy);

    if (valueA === valueB) {
      return a.companyName.localeCompare(b.companyName) * direction;
    }

    return valueA > valueB ? direction : -direction;
  });

  const filteredSummary = summarizeRanking(sorted);
  const maxReviewsCount = sorted.reduce(
    (max, item) => Math.max(max, item.totalReviews),
    0,
  );
  const maxNewReviews30d = sorted.reduce(
    (max, item) => Math.max(max, item.newReviews30d),
    0,
  );

  return {
    items: sorted,
    summary,
    filteredSummary,
    maxReviewsCount,
    maxNewReviews30d,
  };
}

function extractReviewCategoryScores(
  metadata: unknown,
): Partial<Record<ReviewCategoryKey, number>> {
  if (!metadata || typeof metadata !== "object") {
    return {};
  }

  const record = metadata as Record<string, unknown>;
  const rawScores = (record.scores ?? record.ratingBreakdown ??
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
    return Number.isFinite(avg) ? Number(avg) : fallback;
  }
  return fallback;
}

function getSortValue(
  item: ReviewsRankingItem,
  sortBy: ReviewsRankingOptions["sortBy"],
): number {
  switch (sortBy) {
    case "reviews":
      return item.totalReviews;
    case "trend":
      return item.trendRatio;
    case "favorites":
      return item.favoritesCount;
    case "rating":
    default:
      return item.averageRating ?? 0;
  }
}

function summarizeRanking(
  items: ReviewsRankingItem[],
): ReviewsRankingSummary {
  const totalCompanies = items.length;
  if (totalCompanies === 0) {
    return {
      totalCompanies: 0,
      totalReviews: 0,
      newReviews30d: 0,
      averageRating: null,
    };
  }

  const totalReviews = items.reduce(
    (sum, item) => sum + item.totalReviews,
    0,
  );
  const newReviews30d = items.reduce(
    (sum, item) => sum + item.newReviews30d,
    0,
  );
  const ratingSum = items.reduce((sum, item) => {
    return sum + (item.averageRating ?? 0);
  }, 0);
  const averageRating =
    totalCompanies > 0 ? Number(ratingSum / totalCompanies) : null;

  return {
    totalCompanies,
    totalReviews,
    newReviews30d,
    averageRating,
  };
}
