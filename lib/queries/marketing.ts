import { Prisma } from "@prisma/client";

import type { MarketingSpotlight, MarketingSpotlightSection } from "@/lib/types";
import { prisma } from "@/lib/prisma";

const prismaConfigured = Boolean(process.env.DATABASE_URL);

const DEFAULT_SECTION_SLUG = "homepage-forex-offers";

function shouldReturnFallback(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  );
}

export function transformSpotlight(
  spotlight: {
    id: string;
    sectionId: string;
    companyId: string | null;
    title: string;
    headline: string | null;
    badgeLabel: string | null;
    badgeTone: string | null;
    discountValue: number | null;
    rating: Prisma.Decimal | null;
    ratingCount: number | null;
    ctaLabel: string | null;
    ctaUrl: string | null;
    imageUrl: string | null;
    isActive: boolean;
    order: number;
    startsAt: Date | null;
    endsAt: Date | null;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    company?: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
      rating: Prisma.Decimal | null;
    } | null;
  },
): MarketingSpotlight {
  return {
    id: spotlight.id,
    sectionId: spotlight.sectionId,
    companyId: spotlight.companyId,
    title: spotlight.title,
    headline: spotlight.headline,
    badgeLabel: spotlight.badgeLabel,
    badgeTone: spotlight.badgeTone,
    discountValue: spotlight.discountValue,
    rating: spotlight.rating ? Number(spotlight.rating) : null,
    ratingCount: spotlight.ratingCount,
    ctaLabel: spotlight.ctaLabel,
    ctaUrl: spotlight.ctaUrl,
    imageUrl: spotlight.imageUrl,
    isActive: spotlight.isActive,
    order: spotlight.order,
    startsAt: spotlight.startsAt ? spotlight.startsAt.toISOString() : null,
    endsAt: spotlight.endsAt ? spotlight.endsAt.toISOString() : null,
    metadata: (spotlight.metadata as Record<string, unknown> | null) ?? null,
    createdAt: spotlight.createdAt.toISOString(),
    updatedAt: spotlight.updatedAt.toISOString(),
    company: spotlight.company
      ? {
          id: spotlight.company.id,
          name: spotlight.company.name,
          slug: spotlight.company.slug,
          logoUrl: spotlight.company.logoUrl,
          rating: spotlight.company.rating ? Number(spotlight.company.rating) : null,
        }
      : null,
  };
}

function mapSection(section: {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  emoji: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  spotlights?: MarketingSpotlight[];
}): MarketingSpotlightSection {
  return {
    id: section.id,
    slug: section.slug,
    title: section.title,
    subtitle: section.subtitle,
    emoji: section.emoji,
    isActive: section.isActive,
    createdAt: section.createdAt.toISOString(),
    updatedAt: section.updatedAt.toISOString(),
    spotlights: section.spotlights ?? [],
  };
}

export async function getMarketingSections(): Promise<MarketingSpotlightSection[]> {
  if (!prismaConfigured) {
    return [];
  }

  try {
    const sections = await prisma.marketingSpotlightSection.findMany({
      orderBy: { createdAt: "asc" },
    });

    return sections.map((section) =>
      mapSection({
        ...section,
        spotlights: [],
      }),
    );
  } catch (error) {
    if (shouldReturnFallback(error)) {
      console.warn("[marketing] prisma unavailable, returning empty sections");
      return [];
    }
    throw error;
  }
}

export async function ensureMarketingSection(
  slug: string = DEFAULT_SECTION_SLUG,
  defaults: Partial<Pick<MarketingSpotlightSection, "title" | "subtitle" | "emoji">> = {},
): Promise<MarketingSpotlightSection | null> {
  if (!prismaConfigured) {
    return null;
  }

  try {
    const section = await prisma.marketingSpotlightSection.upsert({
      where: { slug },
      create: {
        slug,
        title: defaults.title ?? "Oferty specjalne",
        subtitle: defaults.subtitle ?? "Personalizowane kampanie marketingowe",
        emoji: defaults.emoji ?? "🔥",
      },
      update: defaults,
    });

    return mapSection({
      ...section,
      spotlights: [],
    });
  } catch (error) {
    if (shouldReturnFallback(error)) {
      console.warn("[marketing] prisma unavailable, ensure section fallback");
      return null;
    }
    throw error;
  }
}

export interface MarketingSpotlightOptions {
  includeInactive?: boolean;
  limit?: number;
}

export async function getSpotlightsForSection(
  slug: string = DEFAULT_SECTION_SLUG,
  options: MarketingSpotlightOptions = {},
): Promise<MarketingSpotlightSection | null> {
  if (!prismaConfigured) {
    return null;
  }

  const { includeInactive = false, limit } = options;

  try {
    const section = await prisma.marketingSpotlightSection.findUnique({
      where: { slug },
      include: {
        spotlights: {
          where: includeInactive
            ? undefined
            : {
                isActive: true,
                startsAt: {
                  lte: new Date(),
                },
                OR: [
                  { endsAt: null },
                  {
                    endsAt: {
                      gte: new Date(),
                    },
                  },
                ],
              },
          orderBy: { order: "asc" },
          take: limit,
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                rating: true,
              },
            },
          },
        },
      },
    });

    if (!section) {
      return null;
    }

    return mapSection({
      ...section,
      spotlights: section.spotlights.map((spotlight) => transformSpotlight(spotlight)),
    });
  } catch (error) {
    if (shouldReturnFallback(error)) {
      console.warn("[marketing] prisma unavailable, returning fallback spotlights");
      return null;
    }
    throw error;
  }
}

export async function getActiveHomepageSpotlights(limit = 8) {
  const section = await getSpotlightsForSection(DEFAULT_SECTION_SLUG, {
    includeInactive: false,
    limit,
  });

  return section?.spotlights ?? [];
}

export const MARKETING_DEFAULT_SECTION_SLUG = DEFAULT_SECTION_SLUG;

export async function getHomepageMarketingSection(limit = 8) {
  return getSpotlightsForSection(DEFAULT_SECTION_SLUG, {
    includeInactive: false,
    limit,
  });
}

export async function getMarketingCompanyOptions() {
  if (!prismaConfigured) {
    return [];
  }

  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        rating: true,
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
    }));
  } catch (error) {
    if (shouldReturnFallback(error)) {
      console.warn("[marketing] prisma unavailable, returning empty companies");
      return [];
    }
    throw error;
  }
}


