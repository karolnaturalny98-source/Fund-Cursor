"use client";

import { useCallback, useId } from "react";

import {
  SUPPORTED_CURRENCIES,
  formatCurrencyLocalized,
} from "@/lib/currency";
import type { SupportedCurrency } from "@/lib/types";

import { useCurrency } from "@/app/providers/currency-client-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CurrencySwitcherProps {
  layout?: "default" | "compact";
}

export function CurrencySwitcher({ layout = "default" }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();
  const labelId = useId();

  const handleChange = useCallback(
    (next: SupportedCurrency) => {
      setCurrency(next, { source: "user" });
    },
    [setCurrency],
  );

  const triggerClasses =
    layout === "compact"
      ? "h-7 min-w-[64px] rounded-md border px-2 text-[10px] font-semibold uppercase text-foreground shadow-xs"
      : "h-9 min-w-[120px] rounded-md border px-3 text-sm font-medium text-foreground shadow-xs";

  return (
    <div
      className={
        layout === "compact"
          ? "flex items-center gap-2 text-xs uppercase text-muted-foreground"
          : "flex items-center gap-2"
      }
    >
      <span
        id={labelId}
        className={
          layout === "compact"
            ? "text-[9px] font-semibold tracking-wide text-muted-foreground"
            : "text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        }
      >
        Waluta
      </span>
      <Select value={currency} onValueChange={(value) => handleChange(value as SupportedCurrency)}>
        <SelectTrigger
          aria-labelledby={labelId}
          aria-label="Wybierz walutę"
          className={`${triggerClasses} focus-visible:ring-2 focus-visible:ring-primary/60`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {SUPPORTED_CURRENCIES.map((code) => (
            <SelectItem key={code} value={code}>
              {layout === "compact"
                ? code
                : `${formatCurrencyLocalized(1, code).replace(/[0-9\s.,]/g, "").trim() || code} (${code})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
