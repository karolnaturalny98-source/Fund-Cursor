import { Prisma } from "@prisma/client";

import type { DisputeCase, DisputeStatus } from "@/lib/types";
import { prisma } from "@/lib/prisma";

const DISPUTE_INCLUDE = {
  company: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  plan: {
    select: {
      id: true,
      name: true,
    },
  },
  user: {
    select: {
      id: true,
      clerkId: true,
      displayName: true,
      email: true,
    },
  },
  assignedAdmin: {
    select: {
      id: true,
      clerkId: true,
      displayName: true,
      email: true,
    },
  },
} satisfies Prisma.DisputeCaseInclude;

type DisputeRecord = Prisma.DisputeCaseGetPayload<{
  include: typeof DISPUTE_INCLUDE;
}>;

function toNumberOrNull(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  try {
    return Number(value);
  } catch {
    return null;
  }
}

function toJsonInput(
  value: Record<string, unknown> | null | undefined,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return Prisma.JsonNull;
  }
  return value as Prisma.InputJsonValue;
}

function serializeDispute(record: DisputeRecord): DisputeCase {
  return {
    id: record.id,
    userId: record.userId,
    companyId: record.companyId,
    planId: record.planId,
    assignedAdminId: record.assignedAdminId ?? null,
    status: record.status,
    title: record.title,
    category: record.category,
    description: record.description,
    requestedAmount: toNumberOrNull(record.requestedAmount),
    requestedCurrency: record.requestedCurrency ?? null,
    evidenceLinks: record.evidenceLinks ?? [],
    resolutionNotes: record.resolutionNotes ?? null,
    metadata: (record.metadata as Record<string, unknown> | null) ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    company: record.company
      ? {
          id: record.company.id,
          name: record.company.name,
          slug: record.company.slug,
        }
      : null,
    plan: record.plan
      ? {
          id: record.plan.id,
          name: record.plan.name,
        }
      : null,
    user: record.user
      ? {
          id: record.user.id,
          clerkId: record.user.clerkId,
          displayName: record.user.displayName ?? null,
          email: record.user.email ?? null,
        }
      : null,
    assignedAdmin: record.assignedAdmin
      ? {
          id: record.assignedAdmin.id,
          clerkId: record.assignedAdmin.clerkId,
          displayName: record.assignedAdmin.displayName ?? null,
          email: record.assignedAdmin.email ?? null,
        }
      : null,
  };
}

interface PaginationOptions {
  limit?: number;
  cursor?: string | null;
}

interface UserDisputeFilters extends PaginationOptions {
  status?: DisputeStatus | null;
}

export async function getUserDisputes(
  clerkUserId: string,
  { limit = 20, cursor, status }: UserDisputeFilters = {},
) {
  const take = Math.min(Math.max(limit, 1), 50) + 1;

  const where: Prisma.DisputeCaseWhereInput = {
    user: {
      clerkId: clerkUserId,
    },
  };

  if (status) {
    where.status = status;
  }

  const records = await prisma.disputeCase.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: DISPUTE_INCLUDE,
    take,
    ...(cursor
      ? {
          skip: 1,
          cursor: { id: cursor },
        }
      : {}),
  });

  let nextCursor: string | null = null;
  let items = records;

  if (records.length === take) {
    const nextItem = records.pop();
    nextCursor = nextItem?.id ?? null;
    items = records;
  }

  return {
    items: items.map(serializeDispute),
    nextCursor,
  };
}

interface AdminDisputeFilters extends PaginationOptions {
  status?: DisputeStatus | null;
  query?: string | null;
}

export async function getAdminDisputes({
  limit = 25,
  cursor,
  status,
  query,
}: AdminDisputeFilters = {}) {
  const take = Math.min(Math.max(limit, 1), 100) + 1;

  const where: Prisma.DisputeCaseWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (query) {
    const search = query.trim();
    if (search.length > 0) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        {
          company: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          user: {
            OR: [
              { displayName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { clerkId: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }
  }

  const [records, statusCounts] = await Promise.all([
    prisma.disputeCase.findMany({
      where,
      orderBy: [
        {
          status: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      include: DISPUTE_INCLUDE,
      take,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
    }),
    prisma.disputeCase.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
  ]);

  let nextCursor: string | null = null;
  let items = records;

  if (records.length === take) {
    const nextItem = records.pop();
    nextCursor = nextItem?.id ?? null;
    items = records;
  }

  const totals = statusCounts.reduce<Record<DisputeStatus, number>>(
    (acc, entry) => {
      acc[entry.status as DisputeStatus] = entry._count._all;
      return acc;
    },
    {
      OPEN: 0,
      IN_REVIEW: 0,
      WAITING_USER: 0,
      RESOLVED: 0,
      REJECTED: 0,
    },
  );

  return {
    items: items.map(serializeDispute),
    nextCursor,
    totals,
  };
}

export async function getDisputeById(id: string) {
  const record = await prisma.disputeCase.findUnique({
    where: { id },
    include: DISPUTE_INCLUDE,
  });

  if (!record) {
    return null;
  }

  return serializeDispute(record);
}

interface CreateDisputeInput {
  userId: string;
  companyId: string;
  planId?: string | null;
  title: string;
  category: string;
  description: string;
  requestedAmount?: number | null;
  requestedCurrency?: string | null;
  evidenceLinks?: string[];
  metadata?: Record<string, unknown> | null;
}

export async function createDisputeCase({
  userId,
  companyId,
  planId,
  title,
  category,
  description,
  requestedAmount,
  requestedCurrency,
  evidenceLinks,
  metadata,
}: CreateDisputeInput) {
  const record = await prisma.disputeCase.create({
    data: {
      userId,
      companyId,
      planId: planId ?? null,
      title,
      category,
      description,
      requestedAmount:
        requestedAmount !== null && requestedAmount !== undefined
          ? new Prisma.Decimal(requestedAmount)
          : undefined,
      requestedCurrency: requestedCurrency ?? null,
      evidenceLinks: evidenceLinks ?? [],
      metadata: toJsonInput(metadata),
    },
    include: DISPUTE_INCLUDE,
  });

  return serializeDispute(record);
}

interface UpdateDisputeInput {
  status?: DisputeStatus;
  resolutionNotes?: string | null;
  assignedAdminId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function updateDisputeCase(id: string, input: UpdateDisputeInput) {
  const { status, resolutionNotes, assignedAdminId, metadata } = input;

  const record = await prisma.disputeCase.update({
    where: { id },
    data: {
      status,
      resolutionNotes:
        resolutionNotes === undefined ? undefined : resolutionNotes,
      assignedAdminId:
        assignedAdminId !== undefined ? assignedAdminId : undefined,
      metadata: toJsonInput(metadata),
    },
    include: DISPUTE_INCLUDE,
  });

  return serializeDispute(record);
}
