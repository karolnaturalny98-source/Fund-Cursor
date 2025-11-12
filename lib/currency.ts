import type { SupportedCurrency } from "@/lib/types";

const DEFAULT_LOCALE = "pl-PL";

export const DEFAULT_CURRENCY: SupportedCurrency = "USD";

export type CurrencyRates = Record<SupportedCurrency, number>;

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  "USD",
  "EUR",
  "PLN",
  "CZK",
  "GBP",
];

export const FALLBACK_RATES: CurrencyRates = {
  USD: 1,
  EUR: 0.92,
  PLN: 4.08,
  CZK: 23.35,
  GBP: 0.78,
};

const REGION_TO_CURRENCY: Record<string, SupportedCurrency> = {
  PL: "PLN",
  PLK: "PLN",
  PL_PL: "PLN",
  PLP: "PLN",
  CZ: "CZK",
  CZ_CZ: "CZK",
  SK: "EUR",
  DE: "EUR",
  AT: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  PT: "EUR",
  BE: "EUR",
  NL: "EUR",
  LU: "EUR",
  IE: "EUR",
  FI: "EUR",
  EE: "EUR",
  LV: "EUR",
  LT: "EUR",
  MT: "EUR",
  CY: "EUR",
  GB: "GBP",
  UK: "GBP",
  EN_GB: "GBP",
  US: "USD",
  EN_US: "USD",
  AU: "USD",
  CA: "USD",
};

const LANGUAGE_TO_CURRENCY: Record<string, SupportedCurrency> = {
  pl: "PLN",
  cs: "CZK",
  sk: "EUR",
  de: "EUR",
  fr: "EUR",
  es: "EUR",
  it: "EUR",
  pt: "EUR",
  en: "USD",
};

export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return typeof value === "string"
    ? SUPPORTED_CURRENCIES.includes(value.toUpperCase() as SupportedCurrency)
    : false;
}

export function resolveRate(
  currency: string,
  rates: Partial<Record<SupportedCurrency, number>> = FALLBACK_RATES,
): number | null {
  const upper = currency.toUpperCase() as SupportedCurrency;
  if (typeof rates[upper] === "number") {
    return rates[upper] ?? null;
  }
  if (typeof FALLBACK_RATES[upper] === "number") {
    return FALLBACK_RATES[upper];
  }
  return null;
}

export function convertCurrency(
  amount: number,
  from: string,
  to: SupportedCurrency,
  rates?: Partial<Record<SupportedCurrency, number>>,
): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  const fromRate = resolveRate(from, rates);
  const toRate = resolveRate(to, rates);

  if (!fromRate || !toRate) {
    return Number.parseFloat(amount.toFixed(2));
  }

  const amountInUsd = amount / fromRate;
  const converted = amountInUsd * toRate;
  return Number.parseFloat(converted.toFixed(2));
}

export function formatCurrencyLocalized(
  amount: number,
  currency: SupportedCurrency,
  locale = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function inferCurrencyFromLocales(
  acceptLanguageHeader: string | null | undefined,
): SupportedCurrency | null {
  if (!acceptLanguageHeader) {
    return null;
  }

  const locales = acceptLanguageHeader
    .split(",")
    .map((entry) => entry.split(";")[0]?.trim())
    .filter(Boolean) as string[];

  for (const locale of locales) {
    const [language, region] = locale.split(/[-_]/);
    const normalizedRegion = region?.toUpperCase();
    if (normalizedRegion) {
      const byRegion = REGION_TO_CURRENCY[normalizedRegion] ?? REGION_TO_CURRENCY[`${language}_${normalizedRegion}`.toUpperCase()];
      if (byRegion) {
        return byRegion;
      }
    }

    const normalizedLanguage = language?.toLowerCase();
    if (normalizedLanguage && LANGUAGE_TO_CURRENCY[normalizedLanguage]) {
      return LANGUAGE_TO_CURRENCY[normalizedLanguage];
    }
  }

  return null;
}

export function ensureSupportedCurrency(
  candidate: string | null | undefined,
  fallback: SupportedCurrency = DEFAULT_CURRENCY,
): SupportedCurrency {
  if (!candidate) {
    return fallback;
  }
  const upper = candidate.toUpperCase() as SupportedCurrency;
  return SUPPORTED_CURRENCIES.includes(upper) ? upper : fallback;
}
