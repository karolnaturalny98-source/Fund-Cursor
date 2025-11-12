import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface AffiliateQueueItem {
  id: string;
  status: string;
  platform: string | null;
  source: string | null;
  externalId: string;
  userEmail: string | null;
  userConfirmed: boolean | null;
  points: number;
  purchaseAt: Date | null;
  notes: string | null;
  createdAt: Date;
  company: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AffiliateVerificationItem {
  id: string;
  status: string;
  platform: string | null;
  source: string | null;
  externalId: string;
  userEmail: string | null;
  points: number;
  purchaseAt: Date | null;
  verifiedAt: Date | null;
  notes: string | null;
  cashbackTransactionId: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
  };
  cashbackTransaction: {
    id: string;
    status: string;
    points: number;
    approvedAt: Date | null;
  } | null;
}

interface ImportAffiliatePayload {
  companyId: string;
  userId?: string | null;
  platform?: string | null;
  source?: string | null;
  externalId: string;
  userEmail?: string | null;
  amount?: Prisma.Decimal | null;
  currency?: string | null;
  points: number;
  purchaseAt?: Date | null;
  notes?: string | null;
}

export async function importAffiliateTransaction(
  payload: ImportAffiliatePayload,
) {
  return prisma.affiliateTransaction.create({
    data: {
      companyId: payload.companyId,
      userId: payload.userId ?? null,
      platform: payload.platform ?? null,
      source: payload.source ?? null,
      externalId: payload.externalId,
      userEmail: payload.userEmail?.toLowerCase().trim() ?? null,
      amount: payload.amount ?? null,
      currency: payload.currency ?? "USD",
      points: payload.points,
      purchaseAt: payload.purchaseAt ?? null,
      notes: payload.notes ?? null,
      status: "PENDING",
    },
  });
}

export async function findUserIdByEmail(email?: string | null) {
  if (!email) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  });

  return user?.id ?? null;
}

export async function getAffiliateQueue(limit = 50) {
  const records = await prisma.affiliateTransaction.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [
      {
        purchaseAt: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    take: limit,
  });

  return records.map((record) => ({
    id: record.id,
    status: record.status,
    platform: record.platform ?? null,
    source: record.source ?? null,
    externalId: record.externalId,
    userEmail: record.userEmail,
    userConfirmed: record.userConfirmed,
    points: record.points,
    purchaseAt: record.purchaseAt,
    notes: record.notes,
    createdAt: record.createdAt,
    company: record.company,
  }));
}

export async function getApprovedAffiliateTransactionsForVerification(limit = 50) {
  const records = await prisma.affiliateTransaction.findMany({
    where: {
      status: "APPROVED",
      cashbackTransactionId: {
        not: null,
      },
      cashbackTransaction: {
        status: "PENDING",
      },
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      cashbackTransaction: {
        select: {
          id: true,
          status: true,
          points: true,
          approvedAt: true,
        },
      },
    },
    orderBy: [
      {
        verifiedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: limit,
  });

  return records.map((record) => ({
    id: record.id,
    status: record.status,
    platform: record.platform ?? null,
    source: record.source ?? null,
    externalId: record.externalId,
    userEmail: record.userEmail,
    points: record.points,
    purchaseAt: record.purchaseAt,
    verifiedAt: record.verifiedAt,
    notes: record.notes,
    cashbackTransactionId: record.cashbackTransactionId,
    company: record.company,
    cashbackTransaction: record.cashbackTransaction
      ? {
          id: record.cashbackTransaction.id,
          status: record.cashbackTransaction.status,
          points: record.cashbackTransaction.points,
          approvedAt: record.cashbackTransaction.approvedAt,
        }
      : null,
  }));
}

interface ApprovalOptions {
  points?: number | null;
  notes?: string | null;
}

export async function approveAffiliateTransaction(
  id: string,
  options: ApprovalOptions = {},
) {
  const affiliate = await prisma.affiliateTransaction.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!affiliate) {
    throw new Error("AFFILIATE_NOT_FOUND");
  }

  if (affiliate.status === "APPROVED") {
    return affiliate;
  }

  const points = options.points ?? affiliate.points;

  if (points <= 0) {
    throw new Error("INVALID_POINTS");
  }

  const userId =
    affiliate.userId ?? (await findUserIdByEmail(affiliate.userEmail));

  if (!userId) {
    throw new Error("USER_NOT_FOUND_FOR_AFFILIATE");
  }

  if (affiliate.cashbackTransactionId) {
    return prisma.affiliateTransaction.update({
      where: { id },
      data: {
        status: "APPROVED",
        notes: options.notes ?? affiliate.notes,
        verifiedAt: new Date(),
        userId,
      },
    });
  }

  const transactionRef = `affiliate_${affiliate.externalId}`;

  const cashback = await prisma.cashbackTransaction.create({
    data: {
      companyId: affiliate.companyId,
      userId,
      transactionRef,
      points,
      status: "PENDING",
      notes: options.notes ?? affiliate.notes ?? null,
      approvedAt: null,
    },
  });

  return prisma.affiliateTransaction.update({
    where: { id },
    data: {
      status: "APPROVED",
      verifiedAt: new Date(),
      cashbackTransactionId: cashback.id,
      userId,
      points,
      notes: options.notes ?? affiliate.notes ?? null,
    },
  });
}

export async function rejectAffiliateTransaction(
  id: string,
  note?: string | null,
) {
  return prisma.affiliateTransaction.update({
    where: { id },
    data: {
      status: "REJECTED",
      notes: note ?? null,
      verifiedAt: new Date(),
    },
  });
}

export type AffiliateStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AffiliateHistoryParams {
  status?: AffiliateStatus | "ALL";
  startDate?: Date;
  endDate?: Date;
  companyId?: string;
  platform?: string;
  searchQuery?: string;
  minPoints?: number;
  maxPoints?: number;
  cursor?: string;
  take?: number;
}

export interface AffiliateHistoryItem {
  id: string;
  externalId: string;
  status: AffiliateStatus;
  platform: string | null;
  userEmail: string | null;
  amount: number | null;
  currency: string | null;
  points: number;
  purchaseAt: Date | null;
  verifiedAt: Date | null;
  notes: string | null;
  cashbackTransactionId: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    clerkId: string;
    displayName: string | null;
    email: string | null;
  } | null;
  createdAt: Date;
}

export interface AffiliateHistoryResponse {
  transactions: AffiliateHistoryItem[];
  nextCursor: string | null;
}

export async function getAllAffiliateTransactionsHistory(
  params: AffiliateHistoryParams,
): Promise<AffiliateHistoryResponse> {
  const {
    status,
    startDate,
    endDate,
    companyId,
    platform,
    searchQuery,
    minPoints,
    maxPoints,
    cursor,
    take = 20,
  } = params;

  const limit = Math.max(1, Math.min(take, 100));

  const where: Prisma.AffiliateTransactionWhereInput = {};

  // Filter by status
  if (status && status !== "ALL") {
    where.status = status;
  }

  // Filter by date range (use createdAt or purchaseAt)
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

  // Filter by platform
  if (platform) {
    where.platform = platform;
  }

  // Filter by points range
  if (minPoints !== undefined || maxPoints !== undefined) {
    where.points = {};
    if (minPoints !== undefined) {
      where.points.gte = minPoints;
    }
    if (maxPoints !== undefined) {
      where.points.lte = maxPoints;
    }
  }

  // Search query - externalId or userEmail
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase().trim();
    where.OR = [
      {
        externalId: {
          contains: searchLower,
          mode: "insensitive",
        },
      },
      {
        userEmail: {
          contains: searchLower,
          mode: "insensitive",
        },
      },
    ];
  }

  const records = await prisma.affiliateTransaction.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
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
  const nextCursor =
    hasMore && items.length > 0 ? items[items.length - 1].id : null;

  return {
    transactions: items.map((transaction) => ({
      id: transaction.id,
      externalId: transaction.externalId,
      status: transaction.status as AffiliateStatus,
      platform: transaction.platform ?? null,
      userEmail: transaction.userEmail ?? null,
      amount:
        transaction.amount !== null
          ? typeof transaction.amount === "object" && "toNumber" in transaction.amount
            ? (transaction.amount as Prisma.Decimal).toNumber()
            : typeof transaction.amount === "number"
              ? transaction.amount
              : null
          : null,
      currency: transaction.currency ?? null,
      points: transaction.points,
      purchaseAt: transaction.purchaseAt,
      verifiedAt: transaction.verifiedAt,
      notes: transaction.notes ?? null,
      cashbackTransactionId: transaction.cashbackTransactionId ?? null,
      company: {
        id: transaction.company.id,
        name: transaction.company.name,
        slug: transaction.company.slug,
      },
      user: transaction.user
        ? {
            clerkId: transaction.user.clerkId,
            displayName: transaction.user.displayName,
            email: transaction.user.email,
          }
        : null,
      createdAt: transaction.createdAt,
    })),
    nextCursor,
  };
}
