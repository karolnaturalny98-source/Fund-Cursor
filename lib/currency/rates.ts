import { cache } from "react";

import { FALLBACK_RATES, SUPPORTED_CURRENCIES, type CurrencyRates } from "@/lib/currency";
import type { SupportedCurrency } from "@/lib/types";

const EXCHANGE_ENDPOINT = `https://api.exchangerate.host/latest?base=USD&symbols=${SUPPORTED_CURRENCIES.join(",")}`;

export interface CurrencyRatesSnapshot {
  rates: CurrencyRates;
  updatedAt: string | null;
  source: "api" | "fallback";
}

function normalizeRates(
  received: Partial<Record<string, number>> | null | undefined,
): CurrencyRates {
  const resolved: Partial<Record<SupportedCurrency, number>> = {
    USD: 1,
  };

  if (received) {
    for (const currency of SUPPORTED_CURRENCIES) {
      const value = received[currency];
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        resolved[currency] = value;
      }
    }
  }

  const rates: CurrencyRates = { ...FALLBACK_RATES, ...resolved } as CurrencyRates;
  rates.USD = 1;
  return rates;
}

async function fetchRates(): Promise<CurrencyRatesSnapshot> {
  try {
    const response = await fetch(EXCHANGE_ENDPOINT, {
      next: {
        revalidate: 43200,
        tags: ["currency-rates"],
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch currency rates: ${response.status}`);
    }

    const data = (await response.json()) as {
      rates?: Record<string, number>;
      date?: string;
    };

    return {
      rates: normalizeRates(data?.rates),
      updatedAt: data?.date ?? null,
      source: "api",
    };
  } catch (error) {
    console.error("[currency] Falling back to static rates", error);

    return {
      rates: FALLBACK_RATES,
      updatedAt: null,
      source: "fallback",
    };
  }
}

export const getCurrencyRates = cache(fetchRates);
