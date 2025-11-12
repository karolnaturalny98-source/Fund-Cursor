import { prisma } from "@/lib/prisma";

export interface ContentStats {
  totalCompanies: number;
  totalPlans: number;
  totalFaqs: number;
  companiesLast30Days: number;
  plansLast30Days: number;
  faqsLast30Days: number;
  averagePlansPerCompany: number;
  averageFaqsPerCompany: number;
  companiesWithPlans: number;
  companiesWithFaqs: number;
}

export interface ContentTimeSeriesPoint {
  date: string;
  companies: number;
  plans: number;
  faqs: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface TopCompany {
  companyName: string;
  companySlug: string;
  plansCount: number;
  faqsCount: number;
}

export async function getContentStats(): Promise<ContentStats> {
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalCompanies,
    totalPlans,
    totalFaqs,
    companiesLast30Days,
    plansLast30Days,
    faqsLast30Days,
    companiesWithPlans,
    companiesWithFaqs,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.companyPlan.count(),
    prisma.faqItem.count(),
    prisma.company.count({
      where: { createdAt: { gte: last30Days } },
    }),
    prisma.companyPlan.count({
      where: { createdAt: { gte: last30Days } },
    }),
    prisma.faqItem.count({
      where: { createdAt: { gte: last30Days } },
    }),
    prisma.company.count({
      where: {
        plans: {
          some: {},
        },
      },
    }),
    prisma.company.count({
      where: {
        faqs: {
          some: {},
        },
      },
    }),
  ]);

  const averagePlansPerCompany = totalCompanies > 0 ? totalPlans / totalCompanies : 0;
  const averageFaqsPerCompany = totalCompanies > 0 ? totalFaqs / totalCompanies : 0;

  return {
    totalCompanies,
    totalPlans,
    totalFaqs,
    companiesLast30Days,
    plansLast30Days,
    faqsLast30Days,
    averagePlansPerCompany,
    averageFaqsPerCompany,
    companiesWithPlans,
    companiesWithFaqs,
  };
}

export async function getContentTimeSeries(days = 30): Promise<ContentTimeSeriesPoint[]> {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  startDate.setHours(0, 0, 0, 0);

  const [companies, plans, faqs] = await Promise.all([
    prisma.company.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.companyPlan.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.faqItem.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const dailyMap = new Map<string, { companies: number; plans: number; faqs: number }>();

  companies.forEach((item) => {
    const date = new Date(item.createdAt).toISOString().split("T")[0];
    const existing = dailyMap.get(date) || { companies: 0, plans: 0, faqs: 0 };
    dailyMap.set(date, { ...existing, companies: existing.companies + 1 });
  });

  plans.forEach((item) => {
    const date = new Date(item.createdAt).toISOString().split("T")[0];
    const existing = dailyMap.get(date) || { companies: 0, plans: 0, faqs: 0 };
    dailyMap.set(date, { ...existing, plans: existing.plans + 1 });
  });

  faqs.forEach((item) => {
    const date = new Date(item.createdAt).toISOString().split("T")[0];
    const existing = dailyMap.get(date) || { companies: 0, plans: 0, faqs: 0 };
    dailyMap.set(date, { ...existing, faqs: existing.faqs + 1 });
  });

  const result: ContentTimeSeriesPoint[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const data = dailyMap.get(dateStr) || { companies: 0, plans: 0, faqs: 0 };
    result.push({
      date: dateStr,
      companies: data.companies,
      plans: data.plans,
      faqs: data.faqs,
    });
  }

  return result;
}

export async function getContentStatusDistribution(): Promise<{
  companies: StatusDistribution[];
  plans: StatusDistribution[];
}> {
  // For companies, we can group by country or other attributes
  // For plans, we can group by evaluationModel
  const [companyCountries, planModels] = await Promise.all([
    prisma.company.groupBy({
      by: ["country"],
      _count: { id: true },
    }),
    prisma.companyPlan.groupBy({
      by: ["evaluationModel"],
      _count: { id: true },
    }),
  ]);

  const calculateDistribution = (counts: Array<Record<string, unknown> & { _count: { id: number } }>, key: string) => {
    const total = counts.reduce((sum, item) => sum + item._count.id, 0);
    return counts.map((item) => ({
      status: (item[key] as string) || "Brak danych",
      count: item._count.id,
      percentage: total > 0 ? (item._count.id / total) * 100 : 0,
    }));
  };

  return {
    companies: calculateDistribution(companyCountries, "country"),
    plans: calculateDistribution(planModels, "evaluationModel"),
  };
}

export async function getTopCompanies(limit = 5): Promise<TopCompany[]> {
  const companies = await prisma.company.findMany({
    select: {
      name: true,
      slug: true,
      plans: {
        select: {
          id: true,
        },
      },
      faqs: {
        select: {
          id: true,
        },
      },
    },
  });

  const companiesWithCounts = companies.map((company) => ({
    companyName: company.name,
    companySlug: company.slug,
    plansCount: company.plans.length,
    faqsCount: company.faqs.length,
    totalItems: company.plans.length + company.faqs.length,
  }));

  const sorted = companiesWithCounts.sort((a, b) => b.totalItems - a.totalItems).slice(0, limit);

  return sorted.map(({ companyName, companySlug, plansCount, faqsCount }) => ({
    companyName,
    companySlug,
    plansCount,
    faqsCount,
  }));
}

