import type { Metadata } from "next";
import { RankingsExplorer } from "@/components/rankings/rankings-explorer";
import { RankingsPageClient, RankingsMethodologyClient } from "@/components/rankings/rankings-page-client";
import { getRankingsDataset } from "@/lib/queries/rankings";
import Aurora from "@/components/Aurora";
import type {
  RankingFilters,
  RankingsExplorerInitialFilters,
  RankingTabId,
} from "@/lib/types/rankings";

export const metadata: Metadata = {
  title: "Rankingi prop firm | FundedRank",
  description:
    "Przegladaj wielowymiarowe rankingi prop firm: warunki handlowe, wyplaty, spolecznosc, cashback i dynamika wzrostu. Odkryj liderow i wyszukaj firmy idealne dla Twojej strategii.",
};

interface RankingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const FALLBACK_TAB: RankingTabId = "overall";

export default async function RankingsPage({ searchParams }: RankingsPageProps) {
  const params = await searchParams;

  const filters = parseFilters(params);
  const activeTab = parseTabParam(params.tab) ?? FALLBACK_TAB;

  const dataset = await getRankingsDataset(filters);

  const totalReviews = dataset.companies.reduce(
    (sum, company) => sum + company.reviewCount,
    0,
  );
  const totalNewReviews = dataset.companies.reduce(
    (sum, company) => sum + company.newReviews30d,
    0,
  );
  const averageScore =
    dataset.companies.length > 0
      ? dataset.companies.reduce(
          (sum, company) => sum + company.scores.overall,
          0,
        ) / dataset.companies.length
      : 0;

  const topOverall = [...dataset.companies]
    .sort((a, b) => b.scores.overall - a.scores.overall)
    .slice(0, 3);

  const uniqueCountries = dataset.availableCountries.length;
  const uniqueEvaluationModels = dataset.availableEvaluationModels.length;
  const uniqueAccountTypes = dataset.availableAccountTypes.length;

  const initialExplorerFilters: RankingsExplorerInitialFilters = {
    search: filters.search ?? "",
    country: filters.countries?.[0] ?? null,
    evaluationModel: filters.evaluationModels?.[0] ?? null,
    accountType: filters.accountTypes?.[0] ?? null,
    minReviews: filters.minReviews ?? 0,
    hasCashback: filters.hasCashback ?? false,
  };

  return (
    <div className="relative">
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 h-[150vh]">
        <Aurora
          colorStops={["#1e5a3d", "#34d399", "#a7f3d0"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="container relative z-10 flex flex-col gap-10 py-16">
          <RankingsPageClient
            filteredCompanies={dataset.filteredCompanies}
            totalCompanies={dataset.totalCompanies}
            averageScore={averageScore}
            totalNewReviews={totalNewReviews}
            totalReviews={totalReviews}
            topOverall={topOverall.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              scores: { overall: c.scores.overall },
              reviewCount: c.reviewCount,
              favoritesCount: c.favoritesCount,
            }))}
            totalCompaniesCount={dataset.totalCompanies}
            uniqueCountries={uniqueCountries}
            uniqueEvaluationModels={uniqueEvaluationModels}
            uniqueAccountTypes={uniqueAccountTypes}
          />
        </div>
      </section>

      <section className="w-full space-y-12 px-4 py-12 sm:px-6 lg:px-10 xl:px-16">
        <RankingsExplorer
          initialData={dataset}
          initialFilters={initialExplorerFilters}
          initialTab={activeTab}
        />
      </section>

      <section className="border-t border-border/60 bg-muted/10 px-4 py-12 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          <RankingsMethodologyClient
            totalCompanies={dataset.totalCompanies}
            totalReviews={totalReviews}
            uniqueCountries={uniqueCountries}
            uniqueEvaluationModels={uniqueEvaluationModels}
            uniqueAccountTypes={uniqueAccountTypes}
          />
        </div>
      </section>
    </div>
  );
}

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): RankingFilters {
  const search = parseStringParam(params.search);
  const country = parseStringParam(params.country);
  const evaluationModel = parseStringParam(params.model);
  const accountType = parseStringParam(params.account);
  const minReviews = parseNumberParam(params.minReviews);
  const hasCashback = parseBooleanParam(params.cashback);

  return {
    search: search ?? undefined,
    countries: country ? [country] : undefined,
    evaluationModels: evaluationModel ? [evaluationModel] : undefined,
    accountTypes: accountType ? [accountType] : undefined,
    minReviews: typeof minReviews === "number" ? minReviews : undefined,
    hasCashback: hasCashback ?? undefined,
  };
}

export function parseStringParam(
  value: string | string[] | undefined,
): string | null {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0]?.toString() ?? null;
  }
  return value.toString().trim() || null;
}

export function parseNumberParam(
  value: string | string[] | undefined,
): number | null {
  const raw = parseStringParam(value);
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : null;
}

export function parseBooleanParam(
  value: string | string[] | undefined,
): boolean | null {
  const raw = parseStringParam(value);
  if (!raw) {
    return null;
  }
  return raw === "true";
}

export function parseTabParam(
  value: string | string[] | undefined,
): RankingTabId | null {
  const raw = parseStringParam(value);
  if (!raw) {
    return null;
  }
  const allowed: RankingTabId[] = [
    "overall",
    "conditions",
    "payouts",
    "community",
    "cashback",
    "growth",
  ];
  return allowed.includes(raw as RankingTabId) ? (raw as RankingTabId) : null;
}






