'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  DEFAULT_CURRENCY,
  FALLBACK_RATES,
  SUPPORTED_CURRENCIES,
  ensureSupportedCurrency,
  type CurrencyRates,
} from "@/lib/currency";
import type { SupportedCurrency } from "@/lib/types";

const CURRENCY_STORAGE_KEY = "fundedrank:currency";
const CURRENCY_PREF_ENDPOINT = "/api/preferences/currency";
const CURRENCY_RATES_ENDPOINT = "/api/currency/rates";

export interface CurrencyClientProviderProps {
  children: React.ReactNode;
  initialCurrency: SupportedCurrency;
  initialRates: CurrencyRates;
  initialUpdatedAt: string | null;
  persistInitialChoice: boolean;
}

export interface CurrencyContextValue {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency, options?: { source?: "user" | "auto" }) => void;
  rates: CurrencyRates;
  updatedAt: string | null;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyClientProvider({
  children,
  initialCurrency,
  initialRates,
  initialUpdatedAt,
  persistInitialChoice,
}: CurrencyClientProviderProps) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(initialCurrency);
  const [rates, setRates] = useState<CurrencyRates>(initialRates);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt);
  const persistedInitialRef = useRef<boolean>(!persistInitialChoice);
  const inflightRatesRequest = useRef<Promise<void> | null>(null);
  const lastPersistedCurrency = useRef<SupportedCurrency>(initialCurrency);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (stored) {
        const normalized = ensureSupportedCurrency(stored, initialCurrency);
        setCurrencyState(normalized);
        lastPersistedCurrency.current = normalized;
      }
    } catch {
      // Ignore storage access errors (e.g. private mode)
    }
  }, [initialCurrency]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== CURRENCY_STORAGE_KEY || !event.newValue) {
        return;
      }
      const normalized = ensureSupportedCurrency(event.newValue, DEFAULT_CURRENCY);
      setCurrencyState(normalized);
      lastPersistedCurrency.current = normalized;
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const persistCurrency = useCallback(
    async (nextCurrency: SupportedCurrency, source: "user" | "auto") => {
      if (lastPersistedCurrency.current === nextCurrency && source !== "auto") {
        return;
      }

      try {
        window.localStorage.setItem(CURRENCY_STORAGE_KEY, nextCurrency);
      } catch {
        // Swallow storage errors
      }

      lastPersistedCurrency.current = nextCurrency;

      try {
        await fetch(CURRENCY_PREF_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currency: nextCurrency, source }),
          credentials: "include",
        });
      } catch {
        // Preference persistence is best-effort
      }
    },
    [],
  );

  useEffect(() => {
    if (persistInitialChoice && !persistedInitialRef.current) {
      persistedInitialRef.current = true;
      void persistCurrency(currency, "auto");
    }
  }, [currency, persistCurrency, persistInitialChoice]);

  const refreshRates = useCallback(async () => {
    if (inflightRatesRequest.current) {
      return inflightRatesRequest.current;
    }

    const task = (async () => {
      try {
        const response = await fetch(CURRENCY_RATES_ENDPOINT, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error(`Failed to refresh currency rates: ${response.status}`);
        }

        const payload = (await response.json()) as {
          rates?: Record<string, number>;
          updatedAt?: string | null;
        };

        if (payload?.rates) {
          const nextRates = { ...FALLBACK_RATES };
          for (const key of Object.keys(payload.rates)) {
            const rateValue = payload.rates[key];
            if (typeof rateValue === "number" && Number.isFinite(rateValue) && rateValue > 0) {
              if (SUPPORTED_CURRENCIES.includes(key.toUpperCase() as SupportedCurrency)) {
                nextRates[key.toUpperCase() as SupportedCurrency] = rateValue;
              }
            }
          }
          // Always ensure USD is 1
          nextRates.USD = 1;
          setRates(nextRates);
        }

        setUpdatedAt(payload?.updatedAt ?? null);
      } catch {
        // ignore failures; fallback rates stay active
      } finally {
        inflightRatesRequest.current = null;
      }
    })();

    inflightRatesRequest.current = task;
    return task;
  }, []);

  useEffect(() => {
    void refreshRates();
  }, [refreshRates]);

  const setCurrency = useCallback<CurrencyContextValue["setCurrency"]>(
    (nextCurrency, options) => {
      const normalized = ensureSupportedCurrency(nextCurrency, DEFAULT_CURRENCY);
      setCurrencyState(normalized);
      void persistCurrency(normalized, options?.source ?? "user");
    },
    [persistCurrency],
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      rates,
      updatedAt,
      refreshRates,
    }),
    [currency, refreshRates, rates, setCurrency, updatedAt],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyClientProvider");
  }
  return context;
}
