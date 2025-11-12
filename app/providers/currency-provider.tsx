import { cookies, headers } from "next/headers";
import type { PropsWithChildren } from "react";

import {
  DEFAULT_CURRENCY,
  ensureSupportedCurrency,
  inferCurrencyFromLocales,
  isSupportedCurrency,
} from "@/lib/currency";
import { getCurrencyRates } from "@/lib/currency/rates";
import type { SupportedCurrency } from "@/lib/types";

import { CurrencyClientProvider } from "./currency-client-provider";

const CURRENCY_COOKIE_NAME = "fundedrank_currency";

export async function CurrencyProvider({ children }: PropsWithChildren) {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(CURRENCY_COOKIE_NAME)?.value;
  const hasCookie = Boolean(cookieValue && isSupportedCurrency(cookieValue));

  let initialCurrency: SupportedCurrency;
  let persistInitialChoice = false;

  if (hasCookie && cookieValue) {
    initialCurrency = ensureSupportedCurrency(cookieValue, DEFAULT_CURRENCY);
  } else {
    const headerStore = await headers();
    const headerCurrency = inferCurrencyFromLocales(
      headerStore.get("accept-language"),
    );
    initialCurrency = headerCurrency ?? DEFAULT_CURRENCY;
    persistInitialChoice = true;
  }

  const { rates, updatedAt } = await getCurrencyRates();

  return (
    <CurrencyClientProvider
      initialCurrency={initialCurrency}
      initialRates={rates}
      initialUpdatedAt={updatedAt}
      persistInitialChoice={persistInitialChoice}
    >
      {children}
    </CurrencyClientProvider>
  );
}
