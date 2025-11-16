import type { ReactNode } from "react";

import Link from "next/link";
import { cookies, headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";

import { CompareBar } from "@/components/companies/compare-bar";
import { CompareProvider } from "@/components/companies/compare-context";
import { CompareToggle } from "@/components/companies/compare-toggle";
import { FavoriteButton } from "@/components/companies/favorite-button";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { parseCompareParam } from "@/lib/compare";
import { getCompaniesBySlugs } from "@/lib/queries/companies";
import type { Company, SupportedCurrency } from "@/lib/types";
import {
  DEFAULT_CURRENCY,
  convertCurrency,
  ensureSupportedCurrency,
  formatCurrencyLocalized,
  inferCurrencyFromLocales,
  isSupportedCurrency,
  type CurrencyRates,
} from "@/lib/currency";
import { getCurrencyRates } from "@/lib/currency/rates";
import { cn } from "@/lib/utils";

interface ComparePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const selection = parseCompareParam(params.compare);
  const { userId } = await auth();

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("fundedrank_currency")?.value;
  const requestHeaders = await headers();
  const headerCurrency = inferCurrencyFromLocales(
    requestHeaders.get("accept-language"),
  );

  const selectedCurrency: SupportedCurrency = cookieValue && isSupportedCurrency(cookieValue)
    ? ensureSupportedCurrency(cookieValue, DEFAULT_CURRENCY)
    : headerCurrency ?? DEFAULT_CURRENCY;

  const { rates } = await getCurrencyRates();

  const companies = selection.length
    ? await getCompaniesBySlugs(selection, userId)
    : [];

  return (
    <CompareProvider initialSelection={selection}>
      <div className="container space-y-8 py-12">
        <header className="space-y-3">
          <Text variant="eyebrow" tone="muted">
            Porownanie firm
          </Text>
          <Heading level={1} variant="hero">
            Porownaj firmy prop tradingowe
          </Heading>
          <Text variant="body" tone="muted" className="max-w-2xl">
            Dodaj do trzech firm, aby zobaczyc najwazniejsze parametry obok siebie. Link z porownaniem mozna udostepnic znajomym.
          </Text>
        </header>

        {companies.length === 0 ? (
          <EmptyComparisonState />
        ) : (
          <ComparisonTable
            companies={companies}
            currency={selectedCurrency}
            rates={rates}
          />
        )}
      </div>

      <CompareBar />
    </CompareProvider>
  );
}

function EmptyComparisonState() {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/30 p-12 text-center text-sm text-muted-foreground">
      Brak firm do porownania. Wybierz je z listy lub strony szczegolow.
      <div className="mt-4">
        <Link href="/firmy" className={buttonVariants({ variant: "primary" })}>
          Wroc do listy firm
        </Link>
      </div>
    </div>
  );
}

function ComparisonTable({
  companies,
  currency,
  rates,
}: {
  companies: Company[];
  currency: SupportedCurrency;
  rates: CurrencyRates;
}) {
  const headers = companies.map((company) => company.name);
  const rows = buildComparisonRows(companies, currency, rates);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3">Parametr</th>
            {headers.map((header, index) => (
              <th key={header} className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-foreground">{header}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CompareToggle slug={companies[index].slug} size="sm" />
                    <FavoriteButton
                      companyId={companies[index].id}
                      companySlug={companies[index].slug}
                      initialFavorite={companies[index].viewerHasFavorite ?? false}
                      size="icon"
                    />
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.label}>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-foreground">
                {row.label}
              </th>
              {row.values.map((value, index) => (
                <td key={`${row.label}-${index}`} className="px-4 py-3 align-top text-muted-foreground">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function buildComparisonRows(
  companies: Company[],
  currency: SupportedCurrency,
  rates: CurrencyRates,
) {
  return [
    {
      label: "Ocena",
      values: companies.map((company) =>
        typeof company.rating === "number" ? company.rating.toFixed(1) : "Brak",
      ),
    },
    {
      label: "Cashback",
      values: companies.map((company) =>
        typeof company.cashbackRate === "number"
          ? `${company.cashbackRate}%`
          : "Brak",
      ),
    },
    {
      label: "Platnosci",
      values: companies.map((company) =>
        company.paymentMethods.length ? company.paymentMethods.join(", ") : "Brak",
      ),
    },
    {
      label: "Platformy",
      values: companies.map((company) =>
        company.platforms.length ? company.platforms.join(", ") : "Brak",
      ),
    },
    {
      label: "Modele finansowania",
      values: companies.map((company) => {
        // Plans are dynamically loaded but not in base Company type
        const companyWithPlans = company as Company & { plans?: Array<{ evaluationModel: string }> };
        const models = Array.from(
          new Set((companyWithPlans.plans || []).map((plan) => plan.evaluationModel)),
        );
        return models.length ? models.join(", ") : "Brak";
      }),
    },
    {
      label: "Popularny plan",
      values: companies.map((company) => {
        // Plans are dynamically loaded but not in base Company type
        const companyWithPlans = company as Company & { plans?: Array<{ name: string; price: number; currency: string }> };
        const plan = (companyWithPlans.plans || [])[0];
        if (!plan) {
          return "Brak";
        }
        const converted = convertCurrency(
          plan.price,
          plan.currency,
          currency,
          rates,
        );
        const formatted = formatCurrencyLocalized(converted, currency);
        const showOriginal =
          plan.currency.toUpperCase() !== currency.toUpperCase();
        const original = `${plan.price.toLocaleString("pl-PL")} ${plan.currency}`;
        return showOriginal
          ? `${plan.name} - ${formatted} (${original})`
          : `${plan.name} - ${formatted}`;
      }),
    },
    {
      label: "Profit split",
      values: companies.map((company) => {
        // Plans are dynamically loaded but not in base Company type
        const companyWithPlans = company as Company & { plans?: Array<{ profitSplit?: string | null }> };
        const plan = (companyWithPlans.plans || [])[0];
        return plan?.profitSplit ?? "Brak";
      }),
    },
    {
      label: "Wyplaty",
      values: companies.map((company) => company.payoutFrequency ?? "Brak danych"),
    },
    {
      label: "Linki",
      values: companies.map((company) => (
        <div className="flex flex-col gap-2" key={company.slug}>
          <Link
            href={`/firmy/${company.slug}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
          >
            Szczegoly
          </Link>
          {company.websiteUrl ? (
            <Link
              href={company.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
            >
              Strona partnera
            </Link>
          ) : null}
        </div>
      )),
    },
  ] as Array<{ label: string; values: ReactNode[] }>;
}
