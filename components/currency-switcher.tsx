"use client";

import { useCallback } from "react";

import {
  SUPPORTED_CURRENCIES,
  formatCurrencyLocalized,
} from "@/lib/currency";
import type { SupportedCurrency } from "@/lib/types";

import { useCurrency } from "@/app/providers/currency-client-provider";

interface CurrencySwitcherProps {
  layout?: "default" | "compact";
}

export function CurrencySwitcher({ layout = "default" }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const next = event.target.value as SupportedCurrency;
      setCurrency(next, { source: "user" });
    },
    [setCurrency],
  );

  return (
    <div
      className={
        layout === "compact"
          ? "flex items-center gap-2 text-xs uppercase text-muted-foreground"
          : "flex items-center gap-2"
      }
    >
      <label
        className={layout === "compact" ? "text-[9px] font-semibold" : "text-xs font-semibold uppercase text-muted-foreground"}
        htmlFor="currency-switcher"
      >
        {layout === "compact" ? "" : "Waluta"}
      </label>
      <select
        id="currency-switcher"
        value={currency}
        onChange={handleChange}
        className={
          layout === "compact"
            ? "rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-semibold text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/60"
            : "rounded-md border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
        }
      >
        {SUPPORTED_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {layout === "compact" ? code : `${formatCurrencyLocalized(1, code).replace(/[0-9\s.,]/g, "").trim() || code} (${code})`}
          </option>
        ))}
      </select>
    </div>
  );
}
