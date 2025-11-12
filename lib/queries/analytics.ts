import { prisma } from "@/lib/prisma";

export interface ClickSummary {
  total: number;
  last30Days: number;
  last7Days: number;
}

export interface CompanyClickSummary {
  company: {
    id: string;
    name: string;
    slug: string;
  };
  total: number;
  last30Days: number;
  last7Days: number;
}

export interface ClickAnalyticsResult {
  summary: ClickSummary;
  companies: CompanyClickSummary[];
}

export async function getClickAnalytics(
  limit = 20,
): Promise<ClickAnalyticsResult> {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalCount,
    last30Count,
    last7Count,
    allTimeGroup,
    last30Group,
    last7Group,
  ] = await Promise.all([
    prisma.clickEvent.count(),
    prisma.clickEvent.count({
      where: {
        clickedAt: {
          gte: last30Days,
        },
      },
    }),
    prisma.clickEvent.count({
      where: {
        clickedAt: {
          gte: last7Days,
        },
      },
    }),
    prisma.clickEvent.groupBy({
      by: ["companyId"],
      _count: {
        _all: true,
      },
    }),
    prisma.clickEvent.groupBy({
      by: ["companyId"],
      where: {
        clickedAt: {
          gte: last30Days,
        },
      },
      _count: {
        _all: true,
      },
    }),
    prisma.clickEvent.groupBy({
      by: ["companyId"],
      where: {
        clickedAt: {
          gte: last7Days,
        },
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const sortedAllTime = allTimeGroup
    .sort((a, b) => (b._count._all ?? 0) - (a._count._all ?? 0))
    .slice(0, limit);

  const companyIds = sortedAllTime.map((group) => group.companyId);

  if (companyIds.length === 0) {
    return {
      summary: {
        total: totalCount,
        last30Days: last30Count,
        last7Days: last7Count,
      },
      companies: [],
    };
  }

  const companies = await prisma.company.findMany({
    where: {
      id: {
        in: companyIds,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const companyMap = new Map(
    companies.map((company) => [company.id, company]),
  );

  const last30Map = new Map(
    last30Group.map((group) => [group.companyId, group._count._all ?? 0]),
  );
  const last7Map = new Map(
    last7Group.map((group) => [group.companyId, group._count._all ?? 0]),
  );

  const companySummaries: CompanyClickSummary[] = sortedAllTime
    .map((group) => {
      const company = companyMap.get(group.companyId);

      if (!company) {
        return null;
      }

      return {
        company,
        total: group._count._all ?? 0,
        last30Days: last30Map.get(group.companyId) ?? 0,
        last7Days: last7Map.get(group.companyId) ?? 0,
      };
    })
    .filter(
      (item): item is CompanyClickSummary =>
        item !== null && item.company !== undefined,
    );

  return {
    summary: {
      total: totalCount,
      last30Days: last30Count,
      last7Days: last7Count,
    },
    companies: companySummaries,
  };
}



