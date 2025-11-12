import { prisma } from "@/lib/prisma";

export interface CashbackStats {
  // Główne metryki
  pendingAffiliateCount: number;
  pendingRedeemCount: number;
  allPendingCount: number;
  totalInQueue: number;

  // Metryki finansowe
  totalPointsInQueue: number;
  averageTransactionValue: number;
  approvalRate: number;
  rejectionRate: number;

  // Metryki trendów
  transactionsLast7Days: number;
  transactionsLast30Days: number;
  pointsLast7Days: number;
  pointsLast30Days: number;
}

export interface TransactionTimeSeriesPoint {
  date: string;
  transactions: number;
  points: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface TopCompany {
  companyName: string;
  transactionCount: number;
  totalPoints: number;
}

export async function getCashbackStats(): Promise<CashbackStats> {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Główne metryki
  const [pendingAffiliateCount, pendingRedeemCount, totalCashbackCount] = await Promise.all([
    prisma.affiliateTransaction.count({
      where: { status: "PENDING" },
    }),
    prisma.cashbackTransaction.count({
      where: { status: "PENDING", points: { lt: 0 } },
    }),
    prisma.cashbackTransaction.count(),
  ]);

  const totalInQueue = pendingAffiliateCount + totalCashbackCount;

  const allPendingCount = pendingAffiliateCount + pendingRedeemCount;

  // Metryki finansowe
  const [affiliateQueuePoints, redeemQueuePoints, allTransactions] = await Promise.all([
    prisma.affiliateTransaction.aggregate({
      where: { status: "PENDING" },
      _sum: { points: true },
    }),
    prisma.cashbackTransaction.aggregate({
      where: { status: "PENDING", points: { lt: 0 } },
      _sum: { points: true },
    }),
    prisma.cashbackTransaction.findMany({
      where: { status: "APPROVED", points: { gt: 0 } },
      select: { points: true },
    }),
  ]);

  const totalPointsInQueue =
    (affiliateQueuePoints._sum.points ?? 0) + Math.abs(redeemQueuePoints._sum.points ?? 0);

  const averageTransactionValue =
    allTransactions.length > 0
      ? allTransactions.reduce((sum, t) => sum + t.points, 0) / allTransactions.length
      : 0;

  // Metryki aprobacji
  const [approvedCount, rejectedCount, totalProcessed] = await Promise.all([
    prisma.affiliateTransaction.count({
      where: { status: "APPROVED" },
    }),
    prisma.affiliateTransaction.count({
      where: { status: "REJECTED" },
    }),
    prisma.affiliateTransaction.count({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
    }),
  ]);

  const approvalRate = totalProcessed > 0 ? (approvedCount / totalProcessed) * 100 : 0;
  const rejectionRate = totalProcessed > 0 ? (rejectedCount / totalProcessed) * 100 : 0;

  // Metryki trendów
  const [transactionsLast7Days, transactionsLast30Days, pointsLast7Days, pointsLast30Days] =
    await Promise.all([
      prisma.cashbackTransaction.count({
        where: {
          createdAt: { gte: last7Days },
        },
      }),
      prisma.cashbackTransaction.count({
        where: {
          createdAt: { gte: last30Days },
        },
      }),
      prisma.cashbackTransaction.aggregate({
        where: {
          createdAt: { gte: last7Days },
          points: { gt: 0 },
        },
        _sum: { points: true },
      }),
      prisma.cashbackTransaction.aggregate({
        where: {
          createdAt: { gte: last30Days },
          points: { gt: 0 },
        },
        _sum: { points: true },
      }),
    ]);

  return {
    pendingAffiliateCount,
    pendingRedeemCount,
    allPendingCount,
    totalInQueue,
    totalPointsInQueue,
    averageTransactionValue,
    approvalRate,
    rejectionRate,
    transactionsLast7Days,
    transactionsLast30Days,
    pointsLast7Days: pointsLast7Days._sum.points ?? 0,
    pointsLast30Days: pointsLast30Days._sum.points ?? 0,
  };
}

export async function getCashbackTimeSeries(days = 30): Promise<TransactionTimeSeriesPoint[]> {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  startDate.setHours(0, 0, 0, 0);

  const transactions = await prisma.cashbackTransaction.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
      points: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Grupuj po dniach
  const dailyMap = new Map<string, { transactions: number; points: number }>();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt).toISOString().split("T")[0];
    const existing = dailyMap.get(date) || { transactions: 0, points: 0 };
    dailyMap.set(date, {
      transactions: existing.transactions + 1,
      points: existing.points + Math.abs(transaction.points),
    });
  });

  // Wypełnij wszystkie dni w zakresie
  const result: TransactionTimeSeriesPoint[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const data = dailyMap.get(dateStr) || { transactions: 0, points: 0 };
    result.push({
      date: dateStr,
      transactions: data.transactions,
      points: data.points,
    });
  }

  return result;
}

export async function getCashbackStatusDistribution(): Promise<StatusDistribution[]> {
  const [pending, approved, redeemed, rejected] = await Promise.all([
    prisma.cashbackTransaction.count({ where: { status: "PENDING" } }),
    prisma.cashbackTransaction.count({ where: { status: "APPROVED" } }),
    prisma.cashbackTransaction.count({ where: { status: "REDEEMED" } }),
    prisma.cashbackTransaction.count({ where: { status: "REJECTED" } }),
  ]);

  const total = pending + approved + redeemed + rejected;

  return [
    { status: "PENDING", count: pending, percentage: total > 0 ? (pending / total) * 100 : 0 },
    { status: "APPROVED", count: approved, percentage: total > 0 ? (approved / total) * 100 : 0 },
    { status: "REDEEMED", count: redeemed, percentage: total > 0 ? (redeemed / total) * 100 : 0 },
    { status: "REJECTED", count: rejected, percentage: total > 0 ? (rejected / total) * 100 : 0 },
  ];
}

export async function getCashbackTopCompanies(limit = 5): Promise<TopCompany[]> {
  // Pobierz wszystkie transakcje i filtruj w JavaScript
  const transactions = await prisma.cashbackTransaction.findMany({
    select: {
      companyId: true,
      points: true,
    },
  });

  // Filtruj transakcje z companyId i grupuj ręcznie
  const grouped = new Map<
    string,
    { count: number; totalPoints: number }
  >();

  transactions
    .filter((transaction) => transaction.companyId !== null)
    .forEach((transaction) => {
      const companyId = transaction.companyId!;
      const existing = grouped.get(companyId) || {
        count: 0,
        totalPoints: 0,
      };
      grouped.set(companyId, {
        count: existing.count + 1,
        totalPoints: existing.totalPoints + Math.abs(transaction.points),
      });
    });

  // Sortuj i weź top
  const sorted = Array.from(grouped.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit);

  if (sorted.length === 0) {
    return [];
  }

  const companyIds = sorted.map(([id]) => id);
  const companies = await prisma.company.findMany({
    where: { id: { in: companyIds } },
    select: { id: true, name: true },
  });

  const companyMap = new Map(companies.map((c) => [c.id, c.name]));

  return sorted.map(([companyId, data]) => ({
    companyName: companyMap.get(companyId) || "Unknown",
    transactionCount: data.count,
    totalPoints: data.totalPoints,
  }));
}

