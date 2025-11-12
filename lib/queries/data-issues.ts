import type { Prisma } from "@prisma/client";
import type { DataIssueStatus } from "@/lib/types";
import { prisma } from "@/lib/prisma";

export type DataIssueStatusType = "PENDING" | "RESOLVED" | "DISMISSED";

export interface DataIssueHistoryParams {
  status?: DataIssueStatusType | "ALL";
  startDate?: Date;
  endDate?: Date;
  companyId?: string;
  category?: string;
  searchQuery?: string;
  cursor?: string;
  take?: number;
}

export interface DataIssueHistoryItem {
  id: string;
  category: string;
  description: string;
  status: DataIssueStatusType;
  source: string | null;
  createdAt: Date;
  email: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
  } | null;
  plan: {
    id: string;
    name: string;
  } | null;
  user: {
    clerkId: string;
    displayName: string | null;
    email: string | null;
  } | null;
}

export interface DataIssueHistoryResponse {
  items: DataIssueHistoryItem[];
  nextCursor: string | null;
}

export interface PendingDataIssue {
  id: string;
  category: string;
  description: string;
  status: DataIssueStatus;
  source: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
  } | null;
  plan: {
    id: string;
    name: string;
  } | null;
  user: {
    id: string;
    clerkId: string;
    displayName: string | null;
    email: string | null;
  } | null;
  email: string | null;
}

export async function getPendingDataIssues(
  limit = 25,
): Promise<PendingDataIssue[]> {
  const reports = await prisma.dataIssueReport.findMany({
    where: {
      status: "PENDING",
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
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
    },
    take: limit,
  });

  return reports.map((report) => ({
    id: report.id,
    category: report.category,
    description: report.description,
    status: report.status,
    source: report.source ?? null,
    createdAt: report.createdAt.toISOString(),
    company: report.company
      ? {
          id: report.company.id,
          name: report.company.name,
          slug: report.company.slug,
        }
      : null,
    plan: report.plan
      ? {
          id: report.plan.id,
          name: report.plan.name,
        }
      : null,
    user: report.user
      ? {
          id: report.user.id,
          clerkId: report.user.clerkId,
          displayName: report.user.displayName ?? null,
          email: report.user.email ?? null,
        }
      : null,
    email: report.email ?? null,
  }));
}

export async function getAllDataIssuesHistory(
  params: DataIssueHistoryParams,
): Promise<DataIssueHistoryResponse> {
  const {
    status = "ALL",
    startDate,
    endDate,
    companyId,
    category,
    searchQuery,
    cursor,
    take = 20,
  } = params;

  const limit = Math.max(1, Math.min(take, 100));
  const where: Prisma.DataIssueReportWhereInput = {};

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

  // Filter by category
  if (category) {
    where.category = category;
  }

  // Search filter
  if (searchQuery) {
    const search = searchQuery.trim();
    if (search.length > 0) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
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

  const records = await prisma.dataIssueReport.findMany({
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
      plan: {
        select: {
          id: true,
          name: true,
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
    items: items.map((report) => ({
      id: report.id,
      category: report.category,
      description: report.description,
      status: report.status as DataIssueStatusType,
      source: report.source,
      createdAt: report.createdAt,
      email: report.email,
      company: report.company
        ? {
            id: report.company.id,
            name: report.company.name,
            slug: report.company.slug,
          }
        : null,
      plan: report.plan
        ? {
            id: report.plan.id,
            name: report.plan.name,
          }
        : null,
      user: report.user
        ? {
            clerkId: report.user.clerkId,
            displayName: report.user.displayName,
            email: report.user.email,
          }
        : null,
    })),
    nextCursor,
  };
}

export async function updateDataIssueStatus(
  id: string,
  status: DataIssueStatus,
  metadata?: Record<string, unknown> | null,
) {
  await prisma.dataIssueReport.update({
    where: { id },
    data: {
      status,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
    },
  });
}
