import { prisma } from "@/lib/prisma";
import type { DisputeStatus } from "@/lib/types";

export interface SupportStats {
  totalDisputes: number;
  openDisputes: number;
  inReviewDisputes: number;
  waitingUserDisputes: number;
  resolvedDisputes: number;
  rejectedDisputes: number;
  disputesLast30Days: number;
  averageResolutionTime: number; // w dniach
  totalRequestedAmount: number;
}

export interface SupportTimeSeriesPoint {
  date: string;
  disputes: number;
  resolved: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface TopDisputedCompany {
  companyName: string;
  companySlug: string;
  disputesCount: number;
}

export async function getSupportStats(): Promise<SupportStats> {
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalDisputes,
    openDisputes,
    inReviewDisputes,
    waitingUserDisputes,
    resolvedDisputes,
    rejectedDisputes,
    disputesLast30Days,
    resolvedDisputesWithDates,
    allDisputesWithAmounts,
  ] = await Promise.all([
    prisma.disputeCase.count(),
    prisma.disputeCase.count({ where: { status: "OPEN" } }),
    prisma.disputeCase.count({ where: { status: "IN_REVIEW" } }),
    prisma.disputeCase.count({ where: { status: "WAITING_USER" } }),
    prisma.disputeCase.count({ where: { status: "RESOLVED" } }),
    prisma.disputeCase.count({ where: { status: "REJECTED" } }),
    prisma.disputeCase.count({ where: { createdAt: { gte: last30Days } } }),
    prisma.disputeCase.findMany({
      where: {
        status: { in: ["RESOLVED", "REJECTED"] },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.disputeCase.findMany({
      where: {
        requestedAmount: { not: null },
      },
      select: {
        requestedAmount: true,
      },
    }),
  ]);

  // Oblicz średni czas rozwiązania (w dniach)
  let averageResolutionTime = 0;
  if (resolvedDisputesWithDates.length > 0) {
    const totalDays = resolvedDisputesWithDates.reduce((sum, dispute) => {
      const created = new Date(dispute.createdAt);
      const updated = new Date(dispute.updatedAt);
      const diffTime = updated.getTime() - created.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return sum + diffDays;
    }, 0);
    averageResolutionTime = totalDays / resolvedDisputesWithDates.length;
  }

  // Oblicz łączną kwotę żądań
  let totalRequestedAmount = 0;
  if (allDisputesWithAmounts.length > 0) {
    totalRequestedAmount = allDisputesWithAmounts.reduce((sum, dispute) => {
      const amount = dispute.requestedAmount ? Number(dispute.requestedAmount) : 0;
      return sum + amount;
    }, 0);
  }

  return {
    totalDisputes,
    openDisputes,
    inReviewDisputes,
    waitingUserDisputes,
    resolvedDisputes,
    rejectedDisputes,
    disputesLast30Days,
    averageResolutionTime,
    totalRequestedAmount,
  };
}

export async function getSupportTimeSeries(days = 30): Promise<SupportTimeSeriesPoint[]> {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  startDate.setHours(0, 0, 0, 0);

  const [disputes, resolved] = await Promise.all([
    prisma.disputeCase.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.disputeCase.findMany({
      where: {
        status: { in: ["RESOLVED", "REJECTED"] },
        updatedAt: { gte: startDate },
      },
      select: { updatedAt: true },
      orderBy: { updatedAt: "asc" },
    }),
  ]);

  const dailyMap = new Map<string, { disputes: number; resolved: number }>();

  disputes.forEach((item) => {
    const date = new Date(item.createdAt).toISOString().split("T")[0];
    const existing = dailyMap.get(date) || { disputes: 0, resolved: 0 };
    dailyMap.set(date, { ...existing, disputes: existing.disputes + 1 });
  });

  resolved.forEach((item) => {
    const date = new Date(item.updatedAt).toISOString().split("T")[0];
    const existing = dailyMap.get(date) || { disputes: 0, resolved: 0 };
    dailyMap.set(date, { ...existing, resolved: existing.resolved + 1 });
  });

  const result: SupportTimeSeriesPoint[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const data = dailyMap.get(dateStr) || { disputes: 0, resolved: 0 };
    result.push({
      date: dateStr,
      disputes: data.disputes,
      resolved: data.resolved,
    });
  }

  return result;
}

export async function getSupportStatusDistribution(): Promise<StatusDistribution[]> {
  const counts = await prisma.disputeCase.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const total = counts.reduce((sum, item) => sum + item._count.id, 0);

  return counts.map((item) => ({
    status: item.status,
    count: item._count.id,
    percentage: total > 0 ? (item._count.id / total) * 100 : 0,
  }));
}

export async function getTopDisputedCompanies(limit = 5): Promise<TopDisputedCompany[]> {
  const disputes = await prisma.disputeCase.findMany({
    where: {
      companyId: { not: null },
    },
    include: {
      company: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  const grouped = new Map<string, { count: number; name: string; slug: string }>();
  disputes.forEach((dispute) => {
    if (dispute.company) {
      const key = dispute.companyId ?? "";
      const existing = grouped.get(key) || { count: 0, name: dispute.company.name, slug: dispute.company.slug };
      grouped.set(key, { ...existing, count: existing.count + 1 });
    }
  });

  const sorted = Array.from(grouped.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return sorted.map((item) => ({
    companyName: item.name,
    companySlug: item.slug,
    disputesCount: item.count,
  }));
}

