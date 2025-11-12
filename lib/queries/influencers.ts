import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import type {
  InfluencerProfile,
  InfluencerProfileWithUser,
} from "@/lib/types";

// Re-export types for convenience
export type { InfluencerProfile, InfluencerProfileWithUser } from "@/lib/types";

export type InfluencerStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface InfluencerHistoryParams {
  status?: InfluencerStatus | "ALL";
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
  cursor?: string;
  take?: number;
}

export interface InfluencerHistoryItem {
  id: string;
  platform: string;
  handle: string;
  audienceSize: number | null;
  referralCode: string | null;
  status: InfluencerStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    clerkId: string;
    displayName: string | null;
    email: string | null;
  } | null;
}

export interface InfluencerHistoryResponse {
  items: InfluencerHistoryItem[];
  nextCursor: string | null;
}

export async function getInfluencerProfileForUser(
  clerkId: string,
): Promise<InfluencerProfile | null> {
  const profile = await prisma.influencerProfile.findFirst({
    where: {
      user: {
        clerkId,
      },
    },
  });

  if (!profile) {
    return null;
  }

  return serializeProfile(profile);
}

export async function getInfluencerProfiles(
  limit = 50,
): Promise<InfluencerProfileWithUser[]> {
  const profiles = await prisma.influencerProfile.findMany({
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          clerkId: true,
          displayName: true,
          email: true,
        },
      },
    },
  });

  return profiles.map((profile) => ({
    ...serializeProfile(profile),
    user: {
      id: profile.user.id,
      clerkId: profile.user.clerkId,
      displayName: profile.user.displayName ?? null,
      email: profile.user.email ?? null,
    },
  }));
}

export async function getInfluencerProfileById(
  id: string,
): Promise<InfluencerProfileWithUser | null> {
  const profile = await prisma.influencerProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          clerkId: true,
          displayName: true,
          email: true,
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

  return {
    ...serializeProfile(profile),
    user: {
      id: profile.user.id,
      clerkId: profile.user.clerkId,
      displayName: profile.user.displayName ?? null,
      email: profile.user.email ?? null,
    },
  };
}

export async function getApprovedInfluencers(
  limit = 3,
): Promise<InfluencerProfile[]> {
  const profiles = await prisma.influencerProfile.findMany({
    where: {
      status: "APPROVED",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return profiles.map(serializeProfile);
}

export async function getApprovedInfluencerProfiles(
  limit = 50,
): Promise<InfluencerProfileWithUser[]> {
  const profiles = await prisma.influencerProfile.findMany({
    where: {
      status: "APPROVED",
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          clerkId: true,
          displayName: true,
          email: true,
        },
      },
    },
  });

  return profiles.map((profile) => ({
    ...serializeProfile(profile),
    user: {
      id: profile.user.id,
      clerkId: profile.user.clerkId,
      displayName: profile.user.displayName ?? null,
      email: profile.user.email ?? null,
    },
  }));
}

function serializeProfile(profile: {
  id: string;
  platform: string;
  handle: string;
  audienceSize: number | null;
  referralCode: string | null;
  socialLinks: string[] | null;
  bio: string | null;
  status: string;
  preferredCompanies: string[] | null;
  notes: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  const metadata = parseProfileMetadata(profile.metadata);

  return {
    id: profile.id,
    platform: profile.platform,
    handle: profile.handle,
    audienceSize: profile.audienceSize ?? null,
    referralCode: profile.referralCode ?? null,
    socialLinks: profile.socialLinks ?? [],
    bio: profile.bio ?? null,
    status: profile.status as InfluencerProfile["status"],
    preferredCompanies: profile.preferredCompanies ?? [],
    notes: profile.notes ?? null,
    contactEmail: metadata.contactEmail,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  } satisfies InfluencerProfile;
}

export async function getAllInfluencersHistory(
  params: InfluencerHistoryParams,
): Promise<InfluencerHistoryResponse> {
  const {
    status = "ALL",
    startDate,
    endDate,
    searchQuery,
    cursor,
    take = 20,
  } = params;

  const limit = Math.max(1, Math.min(take, 100));
  const where: Prisma.InfluencerProfileWhereInput = {};

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

  // Search filter
  if (searchQuery) {
    const search = searchQuery.trim();
    if (search.length > 0) {
      where.OR = [
        { handle: { contains: search, mode: "insensitive" } },
        { platform: { contains: search, mode: "insensitive" } },
        { referralCode: { contains: search, mode: "insensitive" } },
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

  const records = await prisma.influencerProfile.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
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
    items: items.map((profile) => ({
      id: profile.id,
      platform: profile.platform,
      handle: profile.handle,
      audienceSize: profile.audienceSize,
      referralCode: profile.referralCode,
      status: profile.status as InfluencerStatus,
      notes: profile.notes,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      user: profile.user
        ? {
            clerkId: profile.user.clerkId,
            displayName: profile.user.displayName,
            email: profile.user.email,
          }
        : null,
    })),
    nextCursor,
  };
}

function parseProfileMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return { contactEmail: null };
  }

  const record = metadata as Record<string, unknown>;
  const contactEmail =
    typeof record.contactEmail === "string" && record.contactEmail.length
      ? record.contactEmail
      : null;

  return { contactEmail };
}
