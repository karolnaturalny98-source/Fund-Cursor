import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getRecentTransactions(limit = 10) {
  const transactions = await prisma.cashbackTransaction.findMany({
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
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    status: transaction.status,
    points: transaction.points,
    notes: transaction.notes ?? null,
    createdAt: transaction.createdAt,
    approvedAt: transaction.approvedAt,
    fulfilledAt: transaction.fulfilledAt,
    company: transaction.company
      ? {
          id: transaction.company.id,
          name: transaction.company.name,
          slug: transaction.company.slug,
        }
      : null,
    user: transaction.user
      ? {
          clerkId: transaction.user.clerkId,
          displayName: transaction.user.displayName,
          email: transaction.user.email,
        }
      : null,
  }));
}

export type TransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "REDEEMED"
  | "REJECTED";

export type TransactionHistoryType = "all" | "redeem" | "manual";

export interface TransactionHistoryParams {
  type?: TransactionHistoryType;
  status?: TransactionStatus | "ALL";
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  companyId?: string;
  searchQuery?: string;
  minPoints?: number;
  maxPoints?: number;
  cursor?: string;
  take?: number;
}

export interface TransactionHistoryItem {
  id: string;
  transactionRef: string;
  status: TransactionStatus;
  points: number;
  notes: string | null;
  createdAt: Date;
  approvedAt: Date | null;
  fulfilledAt: Date | null;
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

export interface TransactionHistoryResponse {
  transactions: TransactionHistoryItem[];
  nextCursor: string | null;
}

export interface ManualCashbackQueueItem {
  id: string;
  status: "PENDING";
  points: number;
  notes: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
  } | null;
  user: {
    clerkId: string | null;
    displayName: string | null;
    email: string | null;
  } | null;
}

interface UserTransactionsPageParams {
  userId: string;
  status?: TransactionStatus;
  cursor?: string | null;
  take?: number;
  onlyRedeem?: boolean;
}

export async function getUserTransactionsPage({
  userId,
  status,
  cursor,
  take = 20,
  onlyRedeem = false,
}: UserTransactionsPageParams) {
  const limit = Math.max(1, Math.min(take, 50));

  const where: Prisma.CashbackTransactionWhereInput = {
    user: {
      clerkId: userId,
    },
  };

  if (status) {
    where.status = status;
  }

  if (onlyRedeem) {
    where.points = { lt: 0 };
  }

  const records = await prisma.cashbackTransaction.findMany({
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
          discountCode: true,
          cashbackRate: true,
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
      status: transaction.status as TransactionStatus,
      points: transaction.points,
      createdAt: transaction.createdAt,
      notes: transaction.notes ?? null,
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
    nextCursor,
  };
}

export async function getRedeemQueue(limit = 25) {
  const transactions = await prisma.cashbackTransaction.findMany({
    where: {
      points: {
        lt: 0,
      },
      status: {
        in: ["PENDING", "APPROVED"],
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
      user: {
        select: {
          clerkId: true,
          displayName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    transactionRef: transaction.transactionRef,
    status: transaction.status as TransactionStatus,
    points: transaction.points,
    notes: transaction.notes ?? null,
    createdAt: transaction.createdAt.toISOString(),
    approvedAt: transaction.approvedAt ? transaction.approvedAt.toISOString() : null,
    fulfilledAt: transaction.fulfilledAt ? transaction.fulfilledAt.toISOString() : null,
    company: transaction.company
      ? {
          id: transaction.company.id,
          name: transaction.company.name,
          slug: transaction.company.slug,
        }
      : null,
    user: transaction.user
      ? {
          clerkId: transaction.user.clerkId,
          displayName: transaction.user.displayName,
          email: transaction.user.email,
        }
      : null,
  }));
}

export async function getManualPendingCashbackQueue(limit = 30): Promise<ManualCashbackQueueItem[]> {
  const transactions = await prisma.cashbackTransaction.findMany({
    where: {
      status: "PENDING",
      transactionRef: {
        startsWith: "admin_manual_",
      },
      points: {
        gt: 0,
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
      user: {
        select: {
          clerkId: true,
          displayName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    status: "PENDING" as const,
    points: transaction.points,
    notes: transaction.notes ?? null,
    createdAt: transaction.createdAt.toISOString(),
    company: transaction.company
      ? {
          id: transaction.company.id,
          name: transaction.company.name,
          slug: transaction.company.slug,
        }
      : null,
    user: transaction.user
      ? {
          clerkId: transaction.user.clerkId,
          displayName: transaction.user.displayName,
          email: transaction.user.email,
        }
      : null,
  }));
}

export async function getUserAvailablePoints(userId: string) {
  const [approvedPositive, reservedRedeem] = await Promise.all([
    prisma.cashbackTransaction.aggregate({
      where: {
        user: {
          clerkId: userId,
        },
        status: "APPROVED",
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
          in: ["PENDING", "APPROVED", "REDEEMED"],
        },
        points: {
          lt: 0,
        },
      },
      _sum: {
        points: true,
      },
    }),
  ]);

  return Math.max(
    0,
    toNumberOrZero(approvedPositive._sum.points) -
      Math.abs(toNumberOrZero(reservedRedeem._sum.points)),
  );
}

function toNumberOrZero(value: unknown) {
  if (value === null || value === undefined) {
    return 0;
  }

  const numeric = Number(value);
  return Number.isNaN(numeric) ? 0 : numeric;
}

export async function getAllTransactionsHistory(
  params: TransactionHistoryParams,
): Promise<TransactionHistoryResponse> {
  const {
    type = "all",
    status,
    startDate,
    endDate,
    userId,
    companyId,
    searchQuery,
    minPoints,
    maxPoints,
    cursor,
    take = 20,
  } = params;

  const limit = Math.max(1, Math.min(take, 100));

  const where: Prisma.CashbackTransactionWhereInput = {};

  // Filter by type
  if (type === "redeem") {
    where.points = { lt: 0 };
  } else if (type === "manual") {
    where.points = { gt: 0 };
    where.transactionRef = {
      not: {
        startsWith: "affiliate_",
      },
    };
  }

  // Filter by status
  if (status && status !== "ALL") {
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

  // Filter by user
  if (userId) {
    where.user = {
      clerkId: userId,
    };
  }

  // Filter by points range
  if (minPoints !== undefined || maxPoints !== undefined) {
    const existingPoints =
      typeof where.points === "object" && where.points !== null
        ? (where.points as Prisma.IntFilter)
        : {};
    if (minPoints !== undefined) {
      existingPoints.gte = minPoints;
    }
    if (maxPoints !== undefined) {
      existingPoints.lte = maxPoints;
    }
    where.points = existingPoints;
  }

  // Search query - ID or user email
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase().trim();
    where.OR = [
      {
        transactionRef: {
          contains: searchLower,
          mode: "insensitive",
        },
      },
      {
        user: {
          email: {
            contains: searchLower,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const records = await prisma.cashbackTransaction.findMany({
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
      transactionRef: transaction.transactionRef,
      status: transaction.status as TransactionStatus,
      points: transaction.points,
      notes: transaction.notes ?? null,
      createdAt: transaction.createdAt,
      approvedAt: transaction.approvedAt,
      fulfilledAt: transaction.fulfilledAt,
      company: transaction.company
        ? {
            id: transaction.company.id,
            name: transaction.company.name,
            slug: transaction.company.slug,
          }
        : null,
      user: transaction.user
        ? {
            clerkId: transaction.user.clerkId,
            displayName: transaction.user.displayName,
            email: transaction.user.email,
          }
        : null,
    })),
    nextCursor,
  };
}
