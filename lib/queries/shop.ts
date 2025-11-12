import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface ShopOrderItem {
  id: string;
  status: string;
  source: string | null;
  externalId: string;
  userEmail: string | null;
  userId: string | null;
  userConfirmed: boolean | null;
  amount: number | null;
  currency: string | null;
  points: number;
  purchaseAt: Date | null;
  createdAt: Date;
  company: {
    id: string;
    name: string;
    slug: string;
  };
  plan?: {
    id: string;
    name: string;
    affiliateCommission: number | null;
  } | null;
}

export interface ShopRevenueStats {
  revenue: number;
  costs: number;
  profit: number;
  totalOrders: number;
  approvedOrders: number;
  pendingOrders: number;
  rejectedOrders: number;
  // Nowe KPI
  conversionRate: number; // Conversion Rate (zamówienia / kliknięcia) w %
  averageOrderValue: number; // Średnia wartość zamówienia (AOV)
  approvalRate: number; // Wskaźnik zatwierdzeń (% zatwierdzonych zamówień)
  rejectionRate: number; // Wskaźnik odrzuceń (% odrzuconych zamówień)
  averageCashbackPerOrder: number; // Średni cashback na zamówienie
  averageCommissionPerOrder: number; // Średnia prowizja na zamówienie
  activeUsers: number; // Liczba unikalnych użytkowników którzy złożyli zamówienia
  revenuePerClick: number; // Revenue per Click (RPC)
  averageTimeToApproval: number; // Średni czas od utworzenia do zatwierdzenia (w godzinach)
  // ROI i marże
  roi: number; // Return on Investment (Profit / Costs) * 100
  profitMargin: number; // Profit Margin (Profit / Revenue) * 100
  cashbackRate: number; // Cashback Rate (Costs / Revenue) * 100
  commissionRate: number; // Commission Rate (Commission Total / Revenue) * 100
}

export interface ShopTopCompany {
  companyId: string;
  companyName: string;
  orderCount: number;
  revenue: number;
}

export interface ShopTopPlan {
  planId: string;
  planName: string;
  companyName: string;
  orderCount: number;
  revenue: number;
}

export async function getShopOrdersQueue(limit = 50) {
  const records = await prisma.affiliateTransaction.findMany({
    where: {
      source: "SHOP",
      userId: {
        not: null,
      },
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
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  // Pobierz informacje o planie z notes (format: "Plan: {name} (ID: {planId})")
  const planIds = records
    .map((r) => {
      const match = r.notes?.match(/Plan: .+ \(ID: ([^)]+)\)/);
      return match ? match[1] : null;
    })
    .filter((id): id is string => id !== null);

  const plans = planIds.length > 0
    ? await prisma.companyPlan.findMany({
        where: { id: { in: planIds } },
        select: {
          id: true,
          name: true,
          affiliateCommission: true,
        },
      })
    : [];

  const planMap = new Map(plans.map((p) => [p.id, p]));

  return records.map((record) => {
    const planMatch = record.notes?.match(/Plan: .+ \(ID: ([^)]+)\)/);
    const planId = planMatch ? planMatch[1] : null;
    const plan = planId ? planMap.get(planId) : null;

    return {
      id: record.id,
      status: record.status,
      source: record.source ?? null,
      externalId: record.externalId,
      userEmail: record.userEmail,
      userId: record.userId,
      userConfirmed: record.userConfirmed,
      amount: record.amount ? Number(record.amount) : null,
      currency: record.currency ?? null,
      points: record.points,
      purchaseAt: record.purchaseAt,
      createdAt: record.createdAt,
      company: record.company,
      plan: plan
        ? {
            id: plan.id,
            name: plan.name,
            affiliateCommission: plan.affiliateCommission
              ? Number(plan.affiliateCommission)
              : null,
          }
        : null,
    };
  });
}

export async function getShopOrdersUnlinkedQueue(limit = 50) {
  const records = await prisma.affiliateTransaction.findMany({
    where: {
      source: "SHOP",
      userId: null,
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
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  // Pobierz informacje o planie z notes (format: "Plan: {name} (ID: {planId})")
  const planIds = records
    .map((r) => {
      const match = r.notes?.match(/Plan: .+ \(ID: ([^)]+)\)/);
      return match ? match[1] : null;
    })
    .filter((id): id is string => id !== null);

  const plans = planIds.length > 0
    ? await prisma.companyPlan.findMany({
        where: { id: { in: planIds } },
        select: {
          id: true,
          name: true,
          affiliateCommission: true,
        },
      })
    : [];

  const planMap = new Map(plans.map((p) => [p.id, p]));

  return records.map((record) => {
    const planMatch = record.notes?.match(/Plan: .+ \(ID: ([^)]+)\)/);
    const planId = planMatch ? planMatch[1] : null;
    const plan = planId ? planMap.get(planId) : null;

    return {
      id: record.id,
      status: record.status,
      source: record.source ?? null,
      externalId: record.externalId,
      userEmail: record.userEmail,
      userId: record.userId,
      userConfirmed: record.userConfirmed,
      amount: record.amount ? Number(record.amount) : null,
      currency: record.currency ?? null,
      points: record.points,
      purchaseAt: record.purchaseAt,
      createdAt: record.createdAt,
      company: record.company,
      plan: plan
        ? {
            id: plan.id,
            name: plan.name,
            affiliateCommission: plan.affiliateCommission
              ? Number(plan.affiliateCommission)
              : null,
          }
        : null,
    };
  });
}

export async function linkShopOrderToUser(
  transactionId: string,
  userId: string
) {
  return prisma.affiliateTransaction.update({
    where: { id: transactionId },
    data: { userId },
  });
}

export async function getShopRevenueStats(
  startDate?: Date,
  endDate?: Date
): Promise<ShopRevenueStats> {
  const where: Prisma.AffiliateTransactionWhereInput = {
    source: "SHOP",
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  const [counts] = await Promise.all([
    prisma.affiliateTransaction.groupBy({
      by: ["status"],
      where,
      _count: true,
    }),
  ]);

  // Oblicz revenue, koszty i prowizję tylko dla ZATWIERDZONYCH transakcji
  const approvedWhere: Prisma.AffiliateTransactionWhereInput = {
    ...where,
    status: "APPROVED",
    amount: { not: null },
  };

  const [approvedRevenueResult, approvedCostsResult, approvedTransactions] = await Promise.all([
    prisma.affiliateTransaction.aggregate({
      where: approvedWhere,
      _sum: {
        amount: true,
      },
    }),
    prisma.affiliateTransaction.aggregate({
      where: approvedWhere,
      _sum: {
        points: true,
      },
    }),
    prisma.affiliateTransaction.findMany({
      where: approvedWhere,
      select: {
        amount: true,
        notes: true,
      },
    }),
  ]);

  const revenue = approvedRevenueResult._sum.amount
    ? Number(approvedRevenueResult._sum.amount)
    : 0;
  const costs = approvedCostsResult._sum.points ?? 0;

  // Pobierz informacje o planach z notes (format: "Plan: {name} (ID: {planId})")
  const planIds = approvedTransactions
    .map((t) => {
      const match = t.notes?.match(/Plan: .+ \(ID: ([^)]+)\)/);
      return match ? match[1] : null;
    })
    .filter((id): id is string => id !== null);

  const plans = planIds.length > 0
    ? await prisma.companyPlan.findMany({
        where: { id: { in: planIds } },
        select: {
          id: true,
          affiliateCommission: true,
        },
      })
    : [];

  const planMap = new Map(plans.map((p) => [p.id, p]));

  // Oblicz prowizję afiliacyjną z planu dla każdej transakcji
  const commissionTotal = approvedTransactions.reduce((sum, t) => {
    if (!t.amount) return sum;
    const planMatch = t.notes?.match(/Plan: .+ \(ID: ([^)]+)\)/);
    const planId = planMatch ? planMatch[1] : null;
    const plan = planId ? planMap.get(planId) : null;
    
    if (!plan || !plan.affiliateCommission) return sum;
    
    const amount = Number(t.amount);
    const commission = Number(plan.affiliateCommission);
    return sum + (amount * commission) / 100;
  }, 0);

  // Zarobek = Prowizja od firmy - Koszty cashbacku
  const profit = commissionTotal - costs;

  const totalOrders = counts.reduce((sum, c) => sum + c._count, 0);
  const approvedOrders =
    counts.find((c) => c.status === "APPROVED")?._count ?? 0;
  const pendingOrders =
    counts.find((c) => c.status === "PENDING")?._count ?? 0;
  const rejectedOrders =
    counts.find((c) => c.status === "REJECTED")?._count ?? 0;

  // Pobierz kliknięcia w tym samym okresie
  const clickWhere: Prisma.ClickEventWhereInput = {};
  if (startDate || endDate) {
    clickWhere.clickedAt = {};
    if (startDate) {
      clickWhere.clickedAt.gte = startDate;
    }
    if (endDate) {
      clickWhere.clickedAt.lte = endDate;
    }
  }

  // Pobierz kliknięcia, unikalnych użytkowników i transakcje z datami zatwierdzenia
  const [totalClicks, allTransactions, approvedTransactionsWithDates] = await Promise.all([
    prisma.clickEvent.count({ where: clickWhere }),
    prisma.affiliateTransaction.findMany({
      where,
      select: {
        userId: true,
        userEmail: true,
      },
    }),
    prisma.affiliateTransaction.findMany({
      where: approvedWhere,
      select: {
        createdAt: true,
        verifiedAt: true,
        cashbackTransactionId: true,
        cashbackTransaction: {
          select: {
            approvedAt: true,
          },
        },
      },
    }),
  ]);

  // Oblicz unikalnych użytkowników (użytkownicy z userId lub userEmail)
  const uniqueIdentifiers = new Set<string>();
  allTransactions.forEach((t) => {
    if (t.userId) uniqueIdentifiers.add(`user:${t.userId}`);
    if (t.userEmail) uniqueIdentifiers.add(`email:${t.userEmail}`);
  });
  const activeUsers = uniqueIdentifiers.size;

  // Oblicz nowe KPI
  const conversionRate = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0;
  const averageOrderValue = approvedOrders > 0 && revenue > 0 ? revenue / approvedOrders : 0;
  const approvalRate = totalOrders > 0 ? (approvedOrders / totalOrders) * 100 : 0;
  const rejectionRate = totalOrders > 0 ? (rejectedOrders / totalOrders) * 100 : 0;
  const averageCashbackPerOrder = approvedOrders > 0 ? costs / approvedOrders : 0;
  const averageCommissionPerOrder = approvedOrders > 0 ? commissionTotal / approvedOrders : 0;
  const revenuePerClick = totalClicks > 0 ? revenue / totalClicks : 0;

  // Oblicz średni czas zatwierdzenia (w godzinach)
  // Używamy approvedAt z CashbackTransaction lub verifiedAt z AffiliateTransaction
  const approvedWithDates = approvedTransactionsWithDates.filter((t) => {
    const approvalDate = t.cashbackTransaction?.approvedAt || t.verifiedAt;
    return approvalDate && t.createdAt;
  });
  const averageTimeToApproval =
    approvedWithDates.length > 0
      ? approvedWithDates.reduce((sum, t) => {
          const approvalDate = t.cashbackTransaction?.approvedAt || t.verifiedAt;
          if (!approvalDate) return sum;
          const timeDiff = approvalDate.getTime() - t.createdAt.getTime();
          return sum + timeDiff / (1000 * 60 * 60); // konwersja na godziny
        }, 0) / approvedWithDates.length
      : 0;

  // Oblicz ROI i marże
  const roi = costs > 0 ? (profit / costs) * 100 : 0;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const cashbackRate = revenue > 0 ? (costs / revenue) * 100 : 0;
  const commissionRate = revenue > 0 ? (commissionTotal / revenue) * 100 : 0;

  return {
    revenue,
    costs,
    profit,
    totalOrders,
    approvedOrders,
    pendingOrders,
    rejectedOrders,
    conversionRate,
    averageOrderValue,
    approvalRate,
    rejectionRate,
    averageCashbackPerOrder,
    averageCommissionPerOrder,
    activeUsers,
    revenuePerClick,
    averageTimeToApproval,
    roi,
    profitMargin,
    cashbackRate,
    commissionRate,
  };
}

export async function getShopTopCompanies(limit = 10): Promise<ShopTopCompany[]> {
  const results = await prisma.affiliateTransaction.groupBy({
    by: ["companyId"],
    where: {
      source: "SHOP",
      amount: { not: null },
      status: { not: "REJECTED" },
    },
    _count: true,
    _sum: {
      amount: true,
    },
    orderBy: {
      _count: {
        companyId: "desc",
      },
    },
    take: limit,
  });

  const companyIds = results.map((r) => r.companyId);
  const companies = await prisma.company.findMany({
    where: {
      id: { in: companyIds },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const companyMap = new Map(companies.map((c) => [c.id, c.name]));

  return results.map((result) => ({
    companyId: result.companyId,
    companyName: companyMap.get(result.companyId) ?? "Unknown",
    orderCount: result._count,
    revenue: result._sum.amount ? Number(result._sum.amount) : 0,
  }));
}

export async function getShopTopPlans(limit = 10): Promise<ShopTopPlan[]> {
  // Niestety nie mamy bezpośredniego powiązania planId w AffiliateTransaction
  // Musimy parsować z notes
  // Używamy tylko zatwierdzonych zamówień
  const transactions = await prisma.affiliateTransaction.findMany({
    where: {
      source: "SHOP",
      status: "APPROVED",
      amount: { not: null },
      notes: { contains: "Plan:" },
    },
    include: {
      company: {
        select: {
          name: true,
        },
      },
    },
  });

  const planMap = new Map<string, { planName: string; companyName: string; orderCount: number; revenue: number }>();

  for (const transaction of transactions) {
    // Parsuj planId z notes: "Plan: {name} (ID: {planId})"
    const match = transaction.notes?.match(/Plan: (.+?) \(ID: (.+?)\)/);
    if (match) {
      const planName = match[1];
      const planId = match[2];
      const amount = transaction.amount ? Number(transaction.amount) : 0;

      const existing = planMap.get(planId);
      if (existing) {
        existing.orderCount += 1;
        existing.revenue += amount;
      } else {
        planMap.set(planId, {
          planName,
          companyName: transaction.company.name,
          orderCount: 1,
          revenue: amount,
        });
      }
    }
  }

  return Array.from(planMap.values())
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, limit)
    .map((item, index) => ({
      planId: `plan-${index}`, // Placeholder, bo nie mamy bezpośredniego planId
      planName: item.planName,
      companyName: item.companyName,
      orderCount: item.orderCount,
      revenue: item.revenue,
    }));
}

export async function getShopOrdersHistory(filters: {
  status?: string;
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  userConfirmed?: boolean | null;
}) {
  const where: Prisma.AffiliateTransactionWhereInput = {
    source: "SHOP",
  };

  if (filters.status) {
    where.status = filters.status as "PENDING" | "APPROVED" | "REJECTED";
  }

  if (filters.companyId) {
    where.companyId = filters.companyId;
  }

  const { startDate, endDate } = filters;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  if (filters.userConfirmed !== undefined) {
    if (filters.userConfirmed === null) {
      where.userConfirmed = null;
    } else {
      where.userConfirmed = filters.userConfirmed;
    }
  }

  const records = await prisma.affiliateTransaction.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: filters.limit ?? 50,
  });

  // Pobierz informacje o planie z notes
  const planIds = records
    .map((r) => {
      const match = r.notes?.match(/Plan: .+ \(ID: ([^)]+)\)/);
      return match ? match[1] : null;
    })
    .filter((id): id is string => id !== null);

  const plans = planIds.length > 0
    ? await prisma.companyPlan.findMany({
        where: { id: { in: planIds } },
        select: {
          id: true,
          name: true,
          affiliateCommission: true,
        },
      })
    : [];

  const planMap = new Map(plans.map((p) => [p.id, p]));

  return records.map((record) => {
    const planMatch = record.notes?.match(/Plan: .+ \(ID: ([^)]+)\)/);
    const planId = planMatch ? planMatch[1] : null;
    const plan = planId ? planMap.get(planId) : null;

    return {
      id: record.id,
      status: record.status,
      source: record.source ?? null,
      externalId: record.externalId,
      userEmail: record.userEmail,
      userId: record.userId,
      userConfirmed: record.userConfirmed,
      amount: record.amount ? Number(record.amount) : null,
      currency: record.currency ?? null,
      points: record.points,
      purchaseAt: record.purchaseAt,
      createdAt: record.createdAt,
      company: record.company,
      plan: plan
        ? {
            id: plan.id,
            name: plan.name,
            affiliateCommission: plan.affiliateCommission
              ? Number(plan.affiliateCommission)
              : null,
          }
        : null,
    };
  });
}
