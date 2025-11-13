import { auth } from "@clerk/nextjs/server";
import { CompaniesPageClient } from "@/components/companies/companies-page-client";
import {
  getCompanies,
  getCompanyFiltersMetadata,
} from "@/lib/queries/companies";
import { parseCompareParam } from "@/lib/compare";
import type { CompanySortOption, EvaluationModel } from "@/lib/types";
import { AuroraWrapper } from "@/components/aurora-wrapper";

interface CompaniesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const EVALUATION_VALUES: EvaluationModel[] = [
  "one-step",
  "two-step",
  "instant-funding",
];

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const params = await searchParams;
  const { userId } = await auth();

  const selectedModels = parseModelParam(params.model);
  const minCashback = parseNumericParam(params.cashback);
  const selectedCountries = parseStringArrayParam(params.country);
  const selectedAccountTypes = parseStringArrayParam(params.accountType);
  const minProfitSplit = parseNumericParam(params.payout);
  const sort = parseSortParam(params.sort);
  const initialCompare = parseCompareParam(params.compare);
  const search = parseSearchParam(params.search);

  const [{ countries, accountTypes, profitSplits }, companies] =
    await Promise.all([
      getCompanyFiltersMetadata(),
      getCompanies(
        {
          evaluationModels: selectedModels.length ? selectedModels : undefined,
          minCashback: minCashback ?? undefined,
          countries: selectedCountries.length ? selectedCountries : undefined,
          accountTypes: selectedAccountTypes.length
            ? selectedAccountTypes
            : undefined,
          minProfitSplit: minProfitSplit ?? undefined,
          search: search ?? undefined,
        },
        {
          viewerId: userId,
          sort,
        },
      ),
    ]);

  const activeFilters =
    selectedModels.length > 0 ||
    (minCashback ?? null) !== null ||
    selectedCountries.length > 0 ||
    selectedAccountTypes.length > 0 ||
    (minProfitSplit ?? null) !== null ||
    (search ?? null) !== null;

  return (
    <div className="relative">
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 h-[150vh]">
        <AuroraWrapper
          colorStops={["#34D399", "#a78bfa", "#3b82f6"]}
          blend={0.35}
          amplitude={0.7}
          speed={0.5}
        />
      </div>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="container relative z-10 flex flex-col gap-[clamp(2rem,3vw,2.8rem)] py-[clamp(2.75rem,3.5vw,3.5rem)]">
          <CompaniesPageClient
            companies={companies}
            minCashback={minCashback}
            selectedModels={selectedModels}
            activeFilters={activeFilters}
            initialCompare={initialCompare}
            countryOptions={countries}
            accountTypeOptions={accountTypes}
            profitSplitOptions={profitSplits}
            selectedCountries={selectedCountries}
            selectedAccountTypes={selectedAccountTypes}
            minProfitSplit={minProfitSplit}
            sort={sort}
            search={search}
          />
        </div>
      </section>
    </div>
  );
}

function parseModelParam(
  param: string | string[] | undefined,
): EvaluationModel[] {
  const values = Array.isArray(param) ? param : param ? [param] : [];
  const selection = new Set<EvaluationModel>();

  values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => {
      if (EVALUATION_VALUES.includes(value as EvaluationModel)) {
        selection.add(value as EvaluationModel);
      }
    });

  return Array.from(selection);
}

function parseNumericParam(
  param: string | string[] | undefined,
): number | null {
  const raw = Array.isArray(param) ? param[0] : param;
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseStringArrayParam(
  param: string | string[] | undefined,
): string[] {
  const values = Array.isArray(param) ? param : param ? [param] : [];

  return Array.from(
    new Set(
      values
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function parseSortParam(
  param: string | string[] | undefined,
): CompanySortOption {
  const raw = Array.isArray(param) ? param[0] : param;
  const allowed: CompanySortOption[] = [
    "name",
    "popular",
    "newest",
    "cashback",
    "rating",
  ];

  if (!raw) {
    return "popular";
  }

  if (allowed.includes(raw as CompanySortOption)) {
    return raw as CompanySortOption;
  }

  return "popular";
}

function parseSearchParam(
  param: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(param) ? param[0] : param;
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}
