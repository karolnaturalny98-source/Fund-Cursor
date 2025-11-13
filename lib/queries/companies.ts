import { Prisma, ReviewStatus, CashbackStatus, InfluencerStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/lib/auth";
import { getInfluencerProfileForUser } from "@/lib/queries/influencers";
import { convertCurrency, FALLBACK_RATES } from "@/lib/currency";
import type {
  CompanyCommission,
  CompanyFiltersMetadata,
  CompanyInstrumentGroup,
  CompanyLeverageTier,
  CompanyRules,
  CompanySortOption,
  EvaluationModel,
  HomepageMetrics,
  ReviewExperienceLevel,
} from "@/lib/types";

// Export type alias for companies with plans (used in admin panels)
export type CompanyWithPlans = Awaited<ReturnType<typeof getCompanies>>[number];

const COMPANY_PLAN_LISTING_SELECT: Prisma.CompanyPlanSelect = {
  id: true,
  name: true,
  price: true,
  currency: true,
  evaluationModel: true,
  maxDrawdown: true,
  maxDailyLoss: true,
  profitTarget: true,
  profitSplit: true,
  description: true,
  features: true,
  minTradingDays: true,
  payoutFirstAfterDays: true,
  payoutCycleDays: true,
  leverage: true,
  trailingDrawdown: true,
  refundableFee: true,
  scalingPlan: true,
  accountType: true,
  affiliateUrl: true,
  affiliateCommission: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
};

const COMPANY_PLAN_DETAIL_SELECT: Prisma.CompanyPlanSelect = {
  ...COMPANY_PLAN_LISTING_SELECT,
  priceHistory: {
    select: {
      id: true,
      price: true,
      currency: true,
      recordedAt: true,
    },
    orderBy: {
      recordedAt: "desc" as Prisma.SortOrder,
    },
    take: 12,
  },
};

const COMPANY_LISTING_SELECT: Prisma.CompanySelect = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  headline: true,
  country: true,
  foundedYear: true,
  shortDescription: true,
  websiteUrl: true,
  discountCode: true,
  cashbackRate: true,
  payoutFrequency: true,
  rating: true,
  verificationStatus: true,
  regulation: true,
  highlights: true,
  socials: true,
  licenses: true,
  registryLinks: true,
  registryData: true,
  kycRequired: true,
  supportContact: true,
  paymentMethods: true,
  instruments: true,
  platforms: true,
  educationLinks: true,
  ceo: true,
  legalName: true,
  headquartersAddress: true,
  foundersInfo: true,
  plans: {
    orderBy: {
      price: "asc" as Prisma.SortOrder,
    },
    select: {
      id: true,
      name: true,
      price: true,
      currency: true,
      evaluationModel: true,
      maxDrawdown: true,
      profitTarget: true,
      profitSplit: true,
      accountType: true,
    },
  },
  _count: {
    select: {
      clicks: true,
    },
  },
  createdAt: true,
};

const COMPANY_DETAIL_SELECT: Prisma.CompanySelect = {
  ...COMPANY_LISTING_SELECT,
  instrumentGroups: true,
  leverageTiers: true,
  tradingCommissions: true,
  firmRules: true,
  plans: {
    orderBy: {
      price: "asc" as Prisma.SortOrder,
    },
    select: COMPANY_PLAN_DETAIL_SELECT,
  },
  faqs: {
    orderBy: {
      order: "asc" as Prisma.SortOrder,
    },
    select: {
      id: true,
      question: true,
      answer: true,
      order: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  reviews: {
    where: {
      status: ReviewStatus.APPROVED,
    },
    orderBy: {
      publishedAt: "desc" as Prisma.SortOrder,
    },
    take: 20,
    select: {
      id: true,
      userId: true,
      rating: true,
      pros: true,
      cons: true,
      body: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      metadata: true,
      user: {
        select: {
          id: true,
          displayName: true,
          clerkId: true,
        },
      },
    },
  },
  teamMembers: {
    orderBy: [
      { level: "asc" as Prisma.SortOrder },
      { order: "asc" as Prisma.SortOrder },
    ],
    select: {
      id: true,
      name: true,
      role: true,
      linkedInUrl: true,
      profileImageUrl: true,
      level: true,
      position: true,
      order: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  timelineItems: {
    orderBy: {
      date: "desc" as Prisma.SortOrder,
    },
    select: {
      id: true,
      title: true,
      description: true,
      date: true,
      type: true,
      icon: true,
      order: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  certifications: {
    orderBy: {
      issuedDate: "desc" as Prisma.SortOrder,
    },
    select: {
      id: true,
      name: true,
      issuer: true,
      description: true,
      url: true,
      imageUrl: true,
      issuedDate: true,
      expiryDate: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  mediaItems: {
    orderBy: {
      publishedAt: "desc" as Prisma.SortOrder,
    },
    select: {
      id: true,
      title: true,
      source: true,
      url: true,
      publishedAt: true,
      description: true,
      imageUrl: true,
      type: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

type CompanyListingRecord = Prisma.CompanyGetPayload<{
  select: typeof COMPANY_LISTING_SELECT;
}>;

type CompanyDetailRecord = Prisma.CompanyGetPayload<{
  select: typeof COMPANY_DETAIL_SELECT;
}>;

type CompanyRecord = CompanyListingRecord & Partial<CompanyDetailRecord>;

type CompanyPlanListingRecord = Prisma.CompanyPlanGetPayload<{
  select: typeof COMPANY_PLAN_LISTING_SELECT;
}>;

type CompanyPlanDetailRecord = Prisma.CompanyPlanGetPayload<{
  select: typeof COMPANY_PLAN_DETAIL_SELECT;
}>;

type CompanyPlanRecord = CompanyPlanListingRecord & Partial<CompanyPlanDetailRecord>;

type CompanyReviewRecord = Prisma.ReviewGetPayload<{
  select: {
    id: true;
    userId: true;
    rating: true;
    pros: true;
    cons: true;
    body: true;
    status: true;
    publishedAt: true;
    createdAt: true;
    updatedAt: true;
    metadata: true;
    user: {
      select: {
        id: true;
        displayName: true;
        clerkId: true;
      };
    };
  };
}>;

export interface CompanyFilters {
  evaluationModels?: EvaluationModel[];
  minCashback?: number;
  maxCashback?: number;
  minRating?: number;
  countries?: string[];
  accountTypes?: string[];
  minProfitSplit?: number;
  search?: string;
}

export interface CompanyQueryOptions {
  viewerId?: string | null;
  sort?: CompanySortOption;
  includeDetails?: boolean;
}

export interface CompanyOption {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  rating?: number | null;
  country?: string | null;
}

export async function getCompanyOptions(): Promise<CompanyOption[]> {
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      rating: true,
      country: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    slug: company.slug,
    logoUrl: company.logoUrl,
    rating: company.rating ? Number(company.rating) : null,
    country: company.country,
  }));
}

// Internal implementation without caching
async function getCompaniesImpl(
  filters: CompanyFilters = {},
  options: CompanyQueryOptions = {},
) {
  const { includeDetails = false, sort = "popular", viewerId = null } = options;
  const where: Prisma.CompanyWhereInput = {};
  const planConditions: Prisma.CompanyPlanWhereInput = {};

  if (filters.evaluationModels && filters.evaluationModels.length > 0) {
    planConditions.evaluationModel = {
      in: filters.evaluationModels,
    };
  }

  if (filters.accountTypes && filters.accountTypes.length > 0) {
    planConditions.accountType = {
      in: filters.accountTypes,
    };
  }

  if (Object.keys(planConditions).length > 0) {
    where.plans = {
      some: planConditions,
    };
  }

  if (filters.countries && filters.countries.length > 0) {
    where.country = {
      in: filters.countries,
    };
  }

  if (filters.search && filters.search.trim().length > 0) {
    where.name = {
      contains: filters.search.trim(),
      mode: "insensitive",
    };
  }

  const cashbackFilter: Prisma.IntNullableFilter = {};
  if (typeof filters.minCashback === "number") {
    cashbackFilter.gte = filters.minCashback;
  }
  if (typeof filters.maxCashback === "number") {
    cashbackFilter.lte = filters.maxCashback;
  }
  if (Object.keys(cashbackFilter).length > 0) {
    where.cashbackRate = cashbackFilter;
  }

  if (typeof filters.minRating === "number") {
    where.rating = {
      gte: filters.minRating,
    };
  }

  const orderByClauses: Prisma.CompanyOrderByWithRelationInput[] = [];

  switch (sort) {
    case "newest":
      orderByClauses.push({ createdAt: "desc" });
      break;
    case "cashback":
      orderByClauses.push({ cashbackRate: "desc" }, { name: "asc" });
      break;
    case "rating":
      orderByClauses.push({ rating: "desc" }, { name: "asc" });
      break;
    case "name":
      orderByClauses.push({ name: "asc" });
      break;
    case "popular":
    default:
      orderByClauses.push({ name: "asc" });
      break;
  }

  const orderBy =
    orderByClauses.length === 1 ? orderByClauses[0] : orderByClauses;
  const select = includeDetails ? COMPANY_DETAIL_SELECT : COMPANY_LISTING_SELECT;

  const companies = await prisma.company.findMany({
    select,
    where,
    orderBy,
  });

  let serialized = companies.map(serializeCompany);

  // Note: minProfitSplit filtering is done in-memory because profitSplit is stored as a string
  // (e.g., "80/20") and requires parsing via extractProfitSplit(). Moving this to WHERE clause
  // would require raw SQL or a computed column. Current approach is acceptable for reasonable dataset sizes.
  if (typeof filters.minProfitSplit === "number") {
    serialized = serialized.filter((company) =>
      company.plans.some((plan) => {
        const profitSplit = extractProfitSplit(plan.profitSplit ?? null);
        return profitSplit !== null && profitSplit >= filters.minProfitSplit!;
      }),
    );
  }

  if (sort === "popular" && serialized.length > 1) {
    serialized = [...serialized].sort((a, b) => {
      const countA = a.clickCount ?? 0;
      const countB = b.clickCount ?? 0;

      if (countA === countB) {
        return a.name.localeCompare(b.name);
      }

      return countB - countA;
    });
  }

  if (!viewerId) {
    return serialized;
  }

  const favoriteRecords = await prisma.favorite.findMany({
    where: {
      companyId: { in: serialized.map((company) => company.id) },
      user: {
        clerkId: viewerId,
      },
    },
    select: {
      companyId: true,
    },
  });

  const favoriteIds = new Set(favoriteRecords.map((favorite) => favorite.companyId));

  return serialized.map((company) => ({
    ...company,
    viewerHasFavorite: favoriteIds.has(company.id),
  }));
}

// Cached version of getCompanies with 5 minute revalidation
// Note: We cache only for requests without viewerId (user-specific favorites can't be cached)
// For requests with filters, cache is still beneficial as filters are often repeated
export async function getCompanies(
  filters: CompanyFilters = {},
  options: CompanyQueryOptions = {},
) {
  // For requests with viewerId, we can't cache effectively due to user-specific favorites
  if (options.viewerId) {
    return getCompaniesImpl(filters, options);
  }

  // Create a stable cache key by sorting filter arrays and normalizing the object
  const normalizedFilters = {
    ...filters,
    evaluationModels: filters.evaluationModels?.slice().sort(),
    countries: filters.countries?.slice().sort(),
    accountTypes: filters.accountTypes?.slice().sort(),
  };
  const cacheKey = JSON.stringify({ filters: normalizedFilters, options });
  
  return unstable_cache(
    async () => getCompaniesImpl(filters, options),
    [`companies-${cacheKey}`],
    {
      revalidate: 300, // Cache for 5 minutes
      tags: ["companies"],
    },
  )();
}

// Cached version of getCompanyFiltersMetadata - metadata changes rarely
const getCompanyFiltersMetadataImpl = async (): Promise<CompanyFiltersMetadata> => {
  const [
    countryRows,
    accountTypeRows,
    profitSplitRows,
    evaluationModelRows,
    priceRange,
  ] = await Promise.all([
    prisma.company.findMany({
      where: {
        country: {
          not: null,
        },
      },
      distinct: ["country"],
      orderBy: {
        country: "asc",
      },
      select: {
        country: true,
      },
    }),
    prisma.companyPlan.findMany({
      where: {
        accountType: {
          not: null,
        },
      },
      distinct: ["accountType"],
      orderBy: {
        accountType: "asc",
      },
      select: {
        accountType: true,
      },
    }),
    prisma.companyPlan.findMany({
      where: {
        profitSplit: {
          not: null,
        },
      },
      distinct: ["profitSplit"],
      select: {
        profitSplit: true,
      },
    }),
    prisma.companyPlan.findMany({
      distinct: ["evaluationModel"],
      select: {
        evaluationModel: true,
      },
    }),
    prisma.companyPlan.aggregate({
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    }),
  ]);

  const countries = countryRows
    .map((entry) => entry.country)
    .filter((value): value is string => Boolean(value));
  const accountTypes = accountTypeRows
    .map((entry) => entry.accountType)
    .filter((value): value is string => Boolean(value));

  const profitSplits = Array.from(
    new Set(
      profitSplitRows
        .map((entry) => extractProfitSplit(entry.profitSplit))
        .filter((value): value is number => value !== null),
    ),
  ).sort((a, b) => a - b);

  const evaluationModels = Array.from(
    new Set(
      evaluationModelRows
        .map((entry) => entry.evaluationModel)
        .filter(
          (value): value is EvaluationModel =>
            value === "one-step" || value === "two-step" || value === "instant-funding",
        ),
    ),
  );

  return {
    countries,
    evaluationModels,
    accountTypes,
    profitSplits,
    minPrice: toNumberOrZero(priceRange._min.price),
    maxPrice: toNumberOrZero(priceRange._max.price),
  };
};

// Cached version with 1 hour revalidation (metadata changes rarely)
export async function getCompanyFiltersMetadata(): Promise<CompanyFiltersMetadata> {
  return unstable_cache(
    async () => getCompanyFiltersMetadataImpl(),
    ["company-filters-metadata"],
    {
      revalidate: 3600, // Cache for 1 hour
      tags: ["companies"],
    },
  )();
}

// Cache company data for 5 minutes to improve performance
const getCachedCompanyData = unstable_cache(
  async (slug: string) => {
    return prisma.company.findUnique({
      where: { slug },
      select: COMPANY_DETAIL_SELECT,
    });
  },
  undefined,
  {
    revalidate: 300, // 5 minutes
    tags: ["companies"],
  }
);

export async function getCompanyBySlug(
  slug: string,
  viewerId?: string | null,
) {
  const company = await getCachedCompanyData(slug);

  if (!company) {
    return null;
  }

  // Check if user has favorited this company
  const favoriteRecord = viewerId
    ? await prisma.favorite.findFirst({
        where: {
          companyId: company.id,
          user: {
            clerkId: viewerId,
          },
        },
        select: {
          id: true,
        },
      })
    : null;

  // Copy metrics removed for performance - can be fetched client-side if needed
  const copyMetrics = {
    last24h: 0,
    last7d: 0,
    total: 0,
  };

  const serialized = serializeCompany(company);

  // Fetch ranking history
  const { getCompanyRankingHistory } = await import("./rankings");
  const rankingHistory = await getCompanyRankingHistory(company.id, 90);

  return {
    ...serialized,
    copyMetrics,
    viewerHasFavorite: Boolean(favoriteRecord),
    rankingHistory: rankingHistory.map((item) => ({
      id: `${item.date}-${company.id}`,
      companyId: company.id,
      overallScore: item.score,
      recordedAt: item.date,
    })),
  };
}

// Cache similar companies lookup for 5 minutes
const getCachedSimilarCompaniesData = unstable_cache(
  async (slug: string, limit: number) => {
    const base = await prisma.company.findUnique({
      where: { slug },
      select: {
        id: true,
        instruments: true,
        platforms: true,
        plans: {
          select: {
            evaluationModel: true,
          },
        },
      },
    });

    if (!base) {
      return null;
    }

    const evaluationModels = Array.from(
      new Set(
        base.plans
          .map((plan) => plan.evaluationModel)
          .filter((model): model is EvaluationModel => !!model),
      ),
    );

    const instruments = base.instruments ?? [];
    const platforms = base.platforms ?? [];

    const filters: Prisma.CompanyWhereInput[] = [];

    if (evaluationModels.length) {
      filters.push({
        plans: {
          some: {
            evaluationModel: {
              in: evaluationModels,
            },
          },
        },
      });
    }

    if (instruments.length) {
      filters.push({
        instruments: {
          hasSome: instruments,
        },
      });
    }

    if (platforms.length) {
      filters.push({
        platforms: {
          hasSome: platforms,
        },
      });
    }

    const similarRecords = await prisma.company.findMany({
      select: COMPANY_DETAIL_SELECT,
      where: {
        id: {
          not: base.id,
        },
        ...(filters.length ? { AND: filters } : {}),
      },
      orderBy: [
        {
          rating: "desc",
        },
        {
          cashbackRate: "desc",
        },
      ],
      take: limit,
    });

    return similarRecords;
  },
  ["similar-companies"],
  {
    revalidate: 300, // 5 minutes
    tags: ["companies"],
  }
);

export async function getSimilarCompanies(
  slug: string,
  limit = 3,
  viewerId?: string | null,
) {
  const similarRecords = await getCachedSimilarCompaniesData(slug, limit);

  if (!similarRecords) {
    return [];
  }

  const serialized = similarRecords.map(serializeCompany);

  if (!viewerId || !serialized.length) {
    return serialized;
  }

  const favorites = await prisma.favorite.findMany({
    where: {
      companyId: {
        in: serialized.map((company) => company.id),
      },
      user: {
        clerkId: viewerId,
      },
    },
    select: {
      companyId: true,
    },
  });

  const favoriteIds = new Set(favorites.map((favorite) => favorite.companyId));

  return serialized.map((company) => ({
    ...company,
    viewerHasFavorite: favoriteIds.has(company.id),
  }));
}

export async function getCompaniesBySlugs(
  slugs: string[],
  viewerId?: string | null,
) {
  if (slugs.length === 0) {
    return [];
  }

  const records = await prisma.company.findMany({
    where: {
      slug: {
        in: slugs,
      },
    },
    select: COMPANY_DETAIL_SELECT,
  });

  const serialized = records.map(serializeCompany);

  const ordered = slugs
    .map((slug) => serialized.find((company) => company.slug === slug))
    .filter((company): company is ReturnType<typeof serializeCompany> => Boolean(company));

  if (!viewerId || !ordered.length) {
    return ordered;
  }

  const favorites = await prisma.favorite.findMany({
    where: {
      companyId: {
        in: ordered.map((company) => company.id),
      },
      user: {
        clerkId: viewerId,
      },
    },
    select: {
      companyId: true,
    },
  });

  const favoriteIds = new Set(favorites.map((favorite) => favorite.companyId));

  return ordered.map((company) => ({
    ...company,
    viewerHasFavorite: favoriteIds.has(company.id),
  }));
}

export async function getFeaturedCompanies(limit = 3) {
  const companies = await prisma.company.findMany({
    select: COMPANY_DETAIL_SELECT,
    orderBy: [
      {
        rating: "desc",
      },
      {
        cashbackRate: "desc",
      },
    ],
    take: limit,
  });

  return companies.map(serializeCompany);
}

export async function getUserSummary(userId: string) {
  const [
    statusTotals,
    favorites,
    recentTransactions,
    approvedPositiveSum,
    reservedRedeemSum,
    influencerProfile,
  ] = await Promise.all([
      prisma.cashbackTransaction.groupBy({
        by: ["status"],
        where: {
          user: {
            clerkId: userId,
          },
        },
        _sum: {
          points: true,
        },
      }),
      prisma.favorite.findMany({
        where: {
          user: {
            clerkId: userId,
          },
        },
        include: {
          company: {
            select: COMPANY_DETAIL_SELECT,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
      prisma.cashbackTransaction.findMany({
        where: {
          user: {
            clerkId: userId,
          },
        },
        orderBy: { createdAt: "desc" },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              discountCode: true,
              cashbackRate: true,
            },
          },
        },
        take: 5,
      }),
      prisma.cashbackTransaction.aggregate({
        where: {
          user: {
            clerkId: userId,
          },
          status: CashbackStatus.APPROVED,
          points: {
            gt: 0,
          },
        },
        _sum: {
          points: true,
        },
      }),
      prisma.cashbackTransaction.aggregate({
        where: {
          user: {
            clerkId: userId,
          },
          status: {
            in: [
              CashbackStatus.PENDING,
              CashbackStatus.APPROVED,
              CashbackStatus.REDEEMED,
            ],
          },
          points: {
            lt: 0,
          },
        },
        _sum: {
          points: true,
        },
      }),
      getInfluencerProfileForUser(userId),
    ]);

  const summary = {
    pending: Math.max(
      0,
      toNumberOrZero(
        statusTotals.find((item) => item.status === "PENDING")?._sum.points,
      ),
    ),
    approved: toNumberOrZero(approvedPositiveSum._sum.points),
    redeemed: toNumberOrZero(
      statusTotals.find((item) => item.status === "REDEEMED")?._sum.points,
    ),
    available: Math.max(
      0,
      toNumberOrZero(approvedPositiveSum._sum.points) -
        Math.abs(toNumberOrZero(reservedRedeemSum._sum.points)),
    ),
  };

  return {
    summary,
    favorites: favorites
      .map((favorite) => favorite.company)
      .filter((company): company is CompanyRecord => Boolean(company))
      .map(serializeCompany),
    recentTransactions: recentTransactions.map((transaction) => ({
      id: transaction.id,
      status: transaction.status,
      points: transaction.points,
      createdAt: transaction.createdAt,
      company: transaction.company
        ? {
            id: transaction.company.id,
            name: transaction.company.name,
            slug: transaction.company.slug,
            discountCode: transaction.company.discountCode,
            cashbackRate: transaction.company.cashbackRate,
          }
        : null,
    })),
    influencerProfile,
  };
}

export async function getHomepageMetrics(): Promise<HomepageMetrics> {
  const [
    companies,
    plans,
    approvedReviews,
    cashbackSum,
    influencers,
    ratingAverage,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.companyPlan.count(),
    prisma.review.count({
      where: { status: ReviewStatus.APPROVED },
    }),
    prisma.cashbackTransaction.aggregate({
      where: {
        status: {
          in: [
            CashbackStatus.APPROVED,
            CashbackStatus.REDEEMED,
          ],
        },
        points: {
          gt: 0,
        },
      },
      _sum: {
        points: true,
      },
    }),
    prisma.influencerProfile.count({
      where: {
        status: InfluencerStatus.APPROVED,
      },
    }),
    prisma.company.aggregate({
      _avg: {
        rating: true,
      },
    }),
  ]);

  const cashbackTotal = toNumberOrZero(cashbackSum._sum.points);
  const averageRating = toNumberOrZero(ratingAverage._avg.rating);

  return {
    totalCompanies: companies,
    totalReviews: approvedReviews,
    avgRating: averageRating,
    totalCashbackPaid: cashbackTotal,
    totalPlans: plans,
    approvedReviews,
    totalCashback: cashbackTotal,
    activeInfluencers: influencers,
  };
}

const HOME_RANKING_SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  country: true,
  foundedYear: true,
  rating: true,
  discountCode: true,
  cashbackRate: true,
  plans: {
    orderBy: {
      price: "desc" as Prisma.SortOrder,
    },
    select: {
      price: true,
      currency: true,
    },
    take: 1,
  },
  _count: {
    select: {
      reviews: {
        where: {
          status: ReviewStatus.APPROVED,
        },
      },
    },
  },
} satisfies Prisma.CompanySelect;

type HomeRankingRecord = Prisma.CompanyGetPayload<{
  select: typeof HOME_RANKING_SELECT;
}>;

export interface HomeRankingCompany {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  country: string | null;
  foundedYear: number | null;
  rating: number | null;
  reviewCount: number;
  cashbackRate: number | null;
  discountCode: string | null;
  maxPlanPriceUsd: number | null;
}

export interface HomeRanking {
  topRated: HomeRankingCompany[];
  topCashback: HomeRankingCompany[];
  newest: HomeRankingCompany[];
}

function mapHomeRankingCompany(record: HomeRankingRecord): HomeRankingCompany {
  const rating = toNumberOrNull(record.rating);
  const cashbackRate = toNumberOrNull(record.cashbackRate);

  let maxPlanPriceUsd: number | null = null;
  const topPlan = record.plans?.[0];
  if (topPlan) {
    const rawPrice = toNumberOrZero(topPlan.price);
    const currency = topPlan.currency ?? "USD";
    const converted = convertCurrency(rawPrice, currency, "USD", FALLBACK_RATES);
    maxPlanPriceUsd = Number.isFinite(converted)
      ? Math.round(converted * 100) / 100
      : null;
  }

  const reviewCount =
    typeof record._count?.reviews === "number" ? record._count.reviews : 0;

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    logoUrl: record.logoUrl ?? null,
    country: record.country ?? null,
    foundedYear: record.foundedYear ?? null,
    rating,
    reviewCount,
    cashbackRate,
    discountCode: record.discountCode ?? null,
    maxPlanPriceUsd,
  };
}

export async function getHomeRanking(limit = 10): Promise<HomeRanking> {
  const [topRated, topCashback, newest] = await Promise.all([
    prisma.company.findMany({
      select: HOME_RANKING_SELECT,
      orderBy: [
        {
          rating: "desc",
        },
        {
          cashbackRate: "desc",
        },
      ],
      take: limit,
    }),
    prisma.company.findMany({
      select: HOME_RANKING_SELECT,
      orderBy: [
        {
          cashbackRate: "desc",
        },
        {
          rating: "desc",
        },
      ],
      take: limit,
    }),
    prisma.company.findMany({
      select: HOME_RANKING_SELECT,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    }),
  ]);

  return {
    topRated: topRated.map(mapHomeRankingCompany),
    topCashback: topCashback.map(mapHomeRankingCompany),
    newest: newest.map(mapHomeRankingCompany),
  };
}

const COMPANY_ADMIN_PLAN_SELECT: Prisma.CompanyPlanSelect = {
  id: true,
  name: true,
  price: true,
  currency: true,
  evaluationModel: true,
  maxDrawdown: true,
  maxDailyLoss: true,
  profitTarget: true,
  profitSplit: true,
  description: true,
  features: true,
  minTradingDays: true,
  payoutFirstAfterDays: true,
  payoutCycleDays: true,
  leverage: true,
  accountType: true,
  affiliateUrl: true,
  affiliateCommission: true,
  notes: true,
  trailingDrawdown: true,
  refundableFee: true,
  scalingPlan: true,
  createdAt: true,
  updatedAt: true,
};

const COMPANY_ADMIN_SELECT = {
  id: true,
  name: true,
  slug: true,
  headline: true,
  logoUrl: true,
  shortDescription: true,
  country: true,
  foundedYear: true,
  websiteUrl: true,
  discountCode: true,
  cashbackRate: true,
  payoutFrequency: true,
  rating: true,
  highlights: true,
  regulation: true,
  supportContact: true,
  socials: true,
  paymentMethods: true,
  instruments: true,
  platforms: true,
  educationLinks: true,
  kycRequired: true,
  ceo: true,
  legalName: true,
  headquartersAddress: true,
  foundersInfo: true,
  verificationStatus: true,
  licenses: true,
  registryLinks: true,
  registryData: true,
  plans: {
    orderBy: {
      price: "asc" as Prisma.SortOrder,
    },
    select: COMPANY_ADMIN_PLAN_SELECT,
  },
  instrumentGroups: true,
  leverageTiers: true,
  tradingCommissions: true,
  firmRules: true,
  faqs: {
    orderBy: {
      order: "asc" as Prisma.SortOrder,
    },
    select: {
      id: true,
      question: true,
      answer: true,
      order: true,
    },
  },
} satisfies Prisma.CompanySelect;

type CompanyAdminPlanRecord = Prisma.CompanyPlanGetPayload<{
  select: typeof COMPANY_ADMIN_PLAN_SELECT;
}>;

type CompanyAdminRecord = Prisma.CompanyGetPayload<{
  select: typeof COMPANY_ADMIN_SELECT;
}>;

export interface AdminCompanyPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  evaluationModel: EvaluationModel;
  profitSplit: string | null;
  description: string | null;
  features: string[];
  maxDrawdown: number | null;
  maxDailyLoss: number | null;
  profitTarget: number | null;
  minTradingDays: number | null;
  payoutFirstAfterDays: number | null;
  payoutCycleDays: number | null;
  leverage: number | null;
  accountType: string | null;
  affiliateUrl: string | null;
  affiliateCommission: number | null;
  notes: string | null;
  trailingDrawdown: boolean | null;
  refundableFee: boolean | null;
  scalingPlan: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCompanyFaq {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface AdminCompany {
  id: string;
  name: string;
  slug: string;
  headline: string | null;
  logoUrl: string | null;
  shortDescription: string | null;
  country: string | null;
  foundedYear: number | null;
  websiteUrl: string | null;
  discountCode: string | null;
  cashbackRate: number | null;
  payoutFrequency: string | null;
  rating: number | null;
  highlights: string[];
  regulation: string | null;
  supportContact: string | null;
  socials: Record<string, unknown> | null;
  paymentMethods: string[];
  instruments: string[];
  platforms: string[];
  educationLinks: string[];
  kycRequired: boolean;
  ceo: string | null;
  legalName: string | null;
  headquartersAddress: string | null;
  foundersInfo: string | null;
  verificationStatus: string | null;
  licenses: string[];
  registryLinks: string[];
  registryData: Record<string, unknown> | null;
  plans: AdminCompanyPlan[];
  instrumentGroups: CompanyInstrumentGroup[];
  leverageTiers: CompanyLeverageTier[];
  tradingCommissions: CompanyCommission[];
  firmRules: CompanyRules;
  faqs: AdminCompanyFaq[];
}

function mapAdminCompanyPlan(plan: CompanyAdminPlanRecord): AdminCompanyPlan {
  const features = Array.isArray(plan.features)
    ? (plan.features.filter((item): item is string => typeof item === "string") as string[])
    : [];

  return {
    id: plan.id,
    name: plan.name,
    price: toNumberOrZero(plan.price),
    currency: plan.currency ?? "USD",
    evaluationModel: plan.evaluationModel as EvaluationModel,
    profitSplit: plan.profitSplit ?? null,
    description: plan.description ?? null,
    features,
    maxDrawdown: toNumberOrNull(plan.maxDrawdown),
    maxDailyLoss: toNumberOrNull(plan.maxDailyLoss),
    profitTarget: toNumberOrNull(plan.profitTarget),
    minTradingDays: plan.minTradingDays ?? null,
    payoutFirstAfterDays: plan.payoutFirstAfterDays ?? null,
    payoutCycleDays: plan.payoutCycleDays ?? null,
    leverage: toNumberOrNull(plan.leverage),
    accountType: plan.accountType ?? null,
    affiliateUrl: plan.affiliateUrl ?? null,
    affiliateCommission: toNumberOrNull(plan.affiliateCommission),
    notes: plan.notes ?? null,
    trailingDrawdown: mapNullableBoolean(plan.trailingDrawdown),
    refundableFee: mapNullableBoolean(plan.refundableFee),
    scalingPlan: mapNullableBoolean(plan.scalingPlan),
    createdAt: toISOString(plan.createdAt) ?? new Date().toISOString(),
    updatedAt: toISOString(plan.updatedAt) ?? new Date().toISOString(),
  };
}

function mapNullableBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return null;
}

function mapAdminCompany(record: CompanyAdminRecord): AdminCompany {
  const socials =
    record.socials && typeof record.socials === "object" && !Array.isArray(record.socials)
      ? (record.socials as Record<string, unknown>)
      : null;

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    headline: record.headline ?? null,
    logoUrl: record.logoUrl ?? null,
    shortDescription: record.shortDescription ?? null,
    country: record.country ?? null,
    foundedYear: record.foundedYear ?? null,
    websiteUrl: record.websiteUrl ?? null,
    discountCode: record.discountCode ?? null,
    cashbackRate: toNumberOrNull(record.cashbackRate),
    payoutFrequency: record.payoutFrequency ?? null,
    rating: toNumberOrNull(record.rating),
    highlights: Array.isArray(record.highlights)
      ? (record.highlights.filter((item): item is string => typeof item === "string") as string[])
      : [],
    regulation: record.regulation ?? null,
    supportContact: record.supportContact ?? null,
    socials,
    paymentMethods: Array.isArray(record.paymentMethods)
      ? (record.paymentMethods.filter((item): item is string => typeof item === "string") as string[])
      : [],
    instruments: Array.isArray(record.instruments)
      ? (record.instruments.filter((item): item is string => typeof item === "string") as string[])
      : [],
    platforms: Array.isArray(record.platforms)
      ? (record.platforms.filter((item): item is string => typeof item === "string") as string[])
      : [],
    educationLinks: Array.isArray(record.educationLinks)
      ? (record.educationLinks.filter((item): item is string => typeof item === "string") as string[])
      : [],
    kycRequired: Boolean(record.kycRequired),
    ceo: record.ceo ?? null,
    legalName: record.legalName ?? null,
    headquartersAddress: record.headquartersAddress ?? null,
    foundersInfo: record.foundersInfo ?? null,
    verificationStatus: record.verificationStatus ?? null,
    licenses: Array.isArray(record.licenses)
      ? (record.licenses.filter((item): item is string => typeof item === "string") as string[])
      : [],
    registryLinks: Array.isArray(record.registryLinks)
      ? (record.registryLinks.filter((item): item is string => typeof item === "string") as string[])
      : [],
    registryData:
      record.registryData && typeof record.registryData === "object" && !Array.isArray(record.registryData)
        ? (record.registryData as Record<string, unknown>)
        : null,
    plans: record.plans.map(mapAdminCompanyPlan),
    instrumentGroups: parseInstrumentGroups(record.instrumentGroups),
    leverageTiers: parseLeverageTiers(record.leverageTiers),
    tradingCommissions: parseTradingCommissions(record.tradingCommissions),
    firmRules: parseCompanyRules(record.firmRules),
    faqs: record.faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
    })),
  };
}

export async function getAdminCompanies(): Promise<AdminCompany[]> {
  const records = await prisma.company.findMany({
    select: COMPANY_ADMIN_SELECT,
    orderBy: {
      name: "asc",
    },
  });

  return records.map(mapAdminCompany);
}

const COMPANY_SUMMARY_SELECT = {
  id: true,
  name: true,
  slug: true,
  headline: true,
  logoUrl: true,
  country: true,
  rating: true,
  cashbackRate: true,
  discountCode: true,
} satisfies Prisma.CompanySelect;

type CompanySummaryRecord = Prisma.CompanyGetPayload<{
  select: typeof COMPANY_SUMMARY_SELECT;
}>;

export interface CompanySummary {
  id: string;
  name: string;
  slug: string;
  headline: string | null;
  logoUrl: string | null;
  country: string | null;
  rating: number | null;
  cashbackRate: number | null;
  discountCode: string | null;
  hasCashback: boolean;
}

export interface CompanySummaryQuery {
  page?: number;
  perPage?: number;
  search?: string;
}

export const DEFAULT_COMPANY_SUMMARY_PAGE_SIZE = 20;
export const MAX_COMPANY_SUMMARY_PAGE_SIZE = 100;

export async function getCompanySummaries({
  page = 1,
  perPage = DEFAULT_COMPANY_SUMMARY_PAGE_SIZE,
  search,
}: CompanySummaryQuery = {}): Promise<{ items: CompanySummary[]; total: number }> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const normalizedPerPage =
    Number.isFinite(perPage) && perPage > 0 ? Math.floor(perPage) : DEFAULT_COMPANY_SUMMARY_PAGE_SIZE;
  const safePerPage = Math.max(1, Math.min(normalizedPerPage, MAX_COMPANY_SUMMARY_PAGE_SIZE));
  const skip = (safePage - 1) * safePerPage;

  const where: Prisma.CompanyWhereInput = {};
  if (search && search.trim().length > 0) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
      { headline: { contains: term, mode: "insensitive" } },
    ];
  }

  const [total, records] = await Promise.all([
    prisma.company.count({ where }),
    prisma.company.findMany({
      select: COMPANY_SUMMARY_SELECT,
      where,
      orderBy: [
        {
          name: "asc",
        },
      ],
      skip,
      take: safePerPage,
    }),
  ]);

  return {
    total,
    items: records.map(mapCompanySummary),
  };
}

function mapCompanySummary(record: CompanySummaryRecord): CompanySummary {
  const cashbackRate = toNumberOrNull(record.cashbackRate);
  const rating = toNumberOrNull(record.rating);

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    headline: record.headline ?? null,
    logoUrl: record.logoUrl ?? null,
    country: record.country ?? null,
    rating,
    cashbackRate,
    discountCode: record.discountCode ?? null,
    hasCashback: typeof cashbackRate === "number" ? cashbackRate > 0 : false,
  };
}

export async function getUserRole(userId: string): Promise<AppRole> {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
    },
  });

  return user ? "user" : "user";
}

function serializeCompany(company: CompanyRecord) {
  const plans = (company.plans ?? []) as CompanyPlanRecord[];
  const reviews = ("reviews" in company && company.reviews ? company.reviews : []) as unknown as CompanyReviewRecord[];
  const teamMembers = company.teamMembers ?? [];
  const timelineItems = company.timelineItems ?? [];
  const certifications = company.certifications ?? [];
  const mediaItems = company.mediaItems ?? [];
  const faqs = company.faqs ?? [];

  const numericRatings = reviews
    .map((review) => review.rating)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const reviewsAverage =
    numericRatings.length > 0
      ? numericRatings.reduce((sum, value) => sum + value, 0) / numericRatings.length
      : null;

  const socials =
    company.socials && typeof company.socials === "object" && !Array.isArray(company.socials)
      ? (company.socials as Record<string, unknown>)
      : null;

  return {
    ...company,
    clickCount: company._count?.clicks ?? 0,
    rating: reviewsAverage ?? toNumberOrNull(company.rating),
    highlights: company.highlights ?? [],
    socials,
    regulation: company.regulation ?? null,
    kycRequired: company.kycRequired ?? false,
    paymentMethods: company.paymentMethods ?? [],
    instruments: company.instruments ?? [],
    platforms: company.platforms ?? [],
    educationLinks: company.educationLinks ?? [],
    supportContact: company.supportContact ?? null,
    ceo: company.ceo ?? null,
    legalName: company.legalName ?? null,
    headquartersAddress: company.headquartersAddress ?? null,
    foundersInfo: company.foundersInfo ?? null,
    verificationStatus: company.verificationStatus ?? null,
    licenses: company.licenses ?? [],
    registryLinks: company.registryLinks ?? [],
    registryData: company.registryData ?? null,
    instrumentGroups: parseInstrumentGroups(company.instrumentGroups),
    leverageTiers: parseLeverageTiers(company.leverageTiers),
    tradingCommissions: parseTradingCommissions(company.tradingCommissions),
    firmRules: parseCompanyRules(company.firmRules),
    plans: plans.map(serializePlan),
    teamMembers: teamMembers.map((member) => ({
      id: member.id,
      companyId: company.id,
      name: member.name,
      role: member.role,
      linkedInUrl: member.linkedInUrl ?? null,
      profileImageUrl: member.profileImageUrl ?? null,
      level: member.level,
      position: member.position ?? null,
      order: member.order,
      createdAt: toISOString(member.createdAt) ?? new Date().toISOString(),
      updatedAt: toISOString(member.updatedAt) ?? new Date().toISOString(),
    })),
    timelineItems: timelineItems.map((item) => ({
      id: item.id,
      companyId: company.id,
      title: item.title,
      description: item.description ?? null,
      date: toISOString(item.date) ?? new Date().toISOString(),
      type: item.type ?? null,
      icon: item.icon ?? null,
      order: item.order,
      createdAt: toISOString(item.createdAt) ?? new Date().toISOString(),
      updatedAt: toISOString(item.updatedAt) ?? new Date().toISOString(),
    })),
    certifications: certifications.map((cert) => ({
      id: cert.id,
      companyId: company.id,
      name: cert.name,
      issuer: cert.issuer ?? null,
      description: cert.description ?? null,
      url: cert.url ?? null,
      imageUrl: cert.imageUrl ?? null,
      issuedDate: toISOString(cert.issuedDate),
      expiryDate: toISOString(cert.expiryDate),
      createdAt: toISOString(cert.createdAt) ?? new Date().toISOString(),
      updatedAt: toISOString(cert.updatedAt) ?? new Date().toISOString(),
    })),
    mediaItems: mediaItems.map((media) => ({
      id: media.id,
      companyId: company.id,
      title: media.title,
      source: media.source ?? null,
      url: media.url,
      publishedAt: toISOString(media.publishedAt) ?? new Date().toISOString(),
      description: media.description ?? null,
      imageUrl: media.imageUrl ?? null,
      type: media.type ?? null,
      createdAt: toISOString(media.createdAt) ?? new Date().toISOString(),
      updatedAt: toISOString(media.updatedAt) ?? new Date().toISOString(),
    })),
    rankingHistory: [],
    faqs: faqs.map((faq) => ({
      id: faq.id,
      companyId: company.id,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      createdAt: toISOString(faq.createdAt) ?? new Date().toISOString(),
      updatedAt: toISOString(faq.updatedAt) ?? new Date().toISOString(),
    })),
    reviews: reviews.map((review) => ({
      id: review.id,
      companyId: company.id,
      userId: review.userId ?? null,
      rating: review.rating,
      pros: review.pros ?? [],
      cons: review.cons ?? [],
      body: review.body ?? null,
      status: review.status,
      metadata: review.metadata,
      publishedAt: toISOString(review.publishedAt),
      createdAt: toISOString(review.createdAt) ?? new Date().toISOString(),
      updatedAt: toISOString(review.updatedAt) ?? new Date().toISOString(),
      ...normalizeReviewMetadata(review.metadata),
      user: review.user
        ? {
            id: review.user.id,
            displayName: review.user.displayName ?? null,
            clerkId: review.user.clerkId,
          }
        : null,
    })),
    // Add timestamps for company
    createdAt: toISOString(company.createdAt) ?? new Date().toISOString(),
    updatedAt: toISOString(company.updatedAt) ?? new Date().toISOString(),
    copyMetrics: null,
    viewerHasFavorite: false,
  };
}

function parseInstrumentGroups(value: unknown): CompanyInstrumentGroup[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const rawTitle = typeof record.title === "string" ? record.title.trim() : "";
      if (!rawTitle) {
        return null;
      }

      const description =
        typeof record.description === "string" && record.description.trim().length
          ? record.description.trim()
          : null;

      const instruments = Array.isArray(record.instruments)
        ? record.instruments
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      return {
        title: rawTitle,
        description,
        instruments,
      };
    })
    .filter((group): group is CompanyInstrumentGroup => group !== null);
}

function parseLeverageTiers(value: unknown): CompanyLeverageTier[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const label =
        typeof record.label === "string" && record.label.trim().length ? record.label.trim() : "Leverage";
      const accountSize =
        typeof record.accountSize === "string" && record.accountSize.trim().length
          ? record.accountSize.trim()
          : null;

      const rawLeverage = record.maxLeverage;
      let maxLeverage: number | null = null;
      if (typeof rawLeverage === "number" && Number.isFinite(rawLeverage)) {
        maxLeverage = rawLeverage;
      } else if (typeof rawLeverage === "string" && rawLeverage.trim().length) {
        const parsed = Number.parseFloat(rawLeverage.trim().replace(",", "."));
        maxLeverage = Number.isFinite(parsed) ? parsed : null;
      }

      const notes =
        typeof record.notes === "string" && record.notes.trim().length ? record.notes.trim() : null;

      return {
        label,
        accountSize,
        maxLeverage,
        notes,
      };
    })
    .filter((tier): tier is CompanyLeverageTier => tier !== null);
}

function parseTradingCommissions(value: unknown): CompanyCommission[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const market =
        typeof record.market === "string" && record.market.trim().length ? record.market.trim() : null;
      const valueText =
        typeof record.value === "string" && record.value.trim().length ? record.value.trim() : null;

      if (!market || !valueText) {
        return null;
      }

      const notes =
        typeof record.notes === "string" && record.notes.trim().length ? record.notes.trim() : null;

      return {
        market,
        value: valueText,
        notes,
      };
    })
    .filter((commission): commission is CompanyCommission => commission !== null);
}

function parseCompanyRules(value: unknown): CompanyRules {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { allowed: [], restricted: [] };
  }

  const record = value as Record<string, unknown>;

  const allowed = Array.isArray(record.allowed)
    ? record.allowed
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const restricted = Array.isArray(record.restricted)
    ? record.restricted
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return { allowed, restricted };
}

const REVIEW_EXPERIENCE_LEVELS: ReviewExperienceLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
  "professional",
];

interface NormalizedReviewMetadata {
  experienceLevel: ReviewExperienceLevel | null;
  tradingStyle: string | null;
  timeframe: string | null;
  monthsWithCompany: number | null;
  accountSize: string | null;
  recommended: boolean | null;
  influencerDisclosure: string | null;
  resourceLinks: string[];
}

function normalizeReviewMetadata(metadata: unknown): NormalizedReviewMetadata {
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

  const rawExperience = record.experienceLevel;
  const experienceLevel =
    typeof rawExperience === "string" &&
    REVIEW_EXPERIENCE_LEVELS.includes(rawExperience as ReviewExperienceLevel)
      ? (rawExperience as ReviewExperienceLevel)
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

// Helper to safely convert Date to ISO string (handles already-serialized dates from cache)
function toISOString(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date.toISOString();
}

function serializePlan(plan: CompanyPlanRecord) {
  const priceHistorySource = Array.isArray(plan.priceHistory) ? plan.priceHistory : [];
  const priceHistory = priceHistorySource.map((entry) => ({
    id: entry.id,
    price: toNumberOrZero(entry.price),
    currency: entry.currency,
    recordedAt: toISOString(entry.recordedAt) ?? new Date().toISOString(),
  }));

  const normalizedPriceHistory =
    priceHistory.length > 0
      ? priceHistory
      : [
          {
            id: `${plan.id}-snapshot`,
            price: toNumberOrZero(plan.price),
            currency: plan.currency,
            recordedAt: toISOString(plan.updatedAt) ?? new Date().toISOString(),
          },
        ];

  return {
    ...plan,
    price: toNumberOrZero(plan.price),
    maxDrawdown: toNumberOrNull(plan.maxDrawdown),
    maxDailyLoss: toNumberOrNull(plan.maxDailyLoss),
    profitTarget: toNumberOrNull(plan.profitTarget),
    evaluationModel: plan.evaluationModel as EvaluationModel,
    features: plan.features ?? [],
    minTradingDays: plan.minTradingDays ?? null,
    payoutFirstAfterDays: plan.payoutFirstAfterDays ?? null,
    payoutCycleDays: plan.payoutCycleDays ?? null,
    leverage: plan.leverage ?? null,
    trailingDrawdown: plan.trailingDrawdown ?? null,
    refundableFee: plan.refundableFee ?? null,
    scalingPlan: plan.scalingPlan ?? null,
    affiliateCommission: toNumberOrNull(plan.affiliateCommission),
    createdAt: toISOString(plan.createdAt) ?? new Date().toISOString(),
    updatedAt: toISOString(plan.updatedAt) ?? new Date().toISOString(),
    priceHistory: normalizedPriceHistory,
  };
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number.parseFloat(value.toString());
  return Number.isNaN(parsed) ? null : parsed;
}

function toNumberOrZero(value: unknown): number {
  const parsed = toNumberOrNull(value);
  return parsed ?? 0;
}

// Helper to convert currency to USD for sorting
function convertToUSD(amount: number, _currency: string): number {
  // For simplicity, assuming USD is base. In production, use real rates.
  // For now, treat all currencies as 1:1 for sorting purposes
  return amount;
}

export const getTopCashbackCompanies = unstable_cache(
  async (limit: number = 8) => {
    const companies = await prisma.company.findMany({
      where: {
        cashbackRate: {
          gt: 0,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        cashbackRate: true,
        plans: {
          select: {
            price: true,
            currency: true,
          },
          orderBy: {
            price: "asc",
          },
        },
      },
    });

    // Calculate cashback ranges and sort
    const companiesWithCashback = companies
      .map((company) => {
        if (!company.plans.length || !company.cashbackRate) {
          return null;
        }

        const prices = company.plans.map((plan) => ({
          price: toNumberOrZero(plan.price),
          currency: plan.currency,
        }));

        // Convert to USD for consistent comparison
        const pricesUSD = prices.map((p) => convertToUSD(p.price, p.currency));
        
        const minPrice = Math.min(...pricesUSD);
        const maxPrice = Math.max(...pricesUSD);

        const minCashback = minPrice * (company.cashbackRate / 100);
        const maxCashback = maxPrice * (company.cashbackRate / 100);

        return {
          id: company.id,
          name: company.name,
          slug: company.slug,
          logoUrl: company.logoUrl,
          cashbackRate: company.cashbackRate,
          minCashback: Math.round(minCashback * 100) / 100,
          maxCashback: Math.round(maxCashback * 100) / 100,
        };
      })
      .filter((company): company is NonNullable<typeof company> => company !== null)
      .sort((a, b) => b.maxCashback - a.maxCashback)
      .slice(0, limit);

    return companiesWithCashback;
  },
  ["top-cashback-companies"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["companies", "cashback"],
  },
);
