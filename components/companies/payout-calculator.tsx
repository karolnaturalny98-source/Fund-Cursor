"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useFadeIn } from "@/lib/animations";

import { Input } from "@/components/ui/input";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { useCurrency } from "@/app/providers/currency-client-provider";
import { convertCurrency, formatCurrencyLocalized } from "@/lib/currency";
import type { CompanyPlan } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PayoutCalculatorProps {
  plans: CompanyPlan[];
  cashbackRate: number | null | undefined;
}

export function PayoutCalculator({
  plans,
  cashbackRate,
}: PayoutCalculatorProps) {
  const { currency, rates } = useCurrency();
  const hasPlans = plans.length > 0;
  const [selectedPlanId, setSelectedPlanId] = useState(() => plans[0]?.id ?? "");
  const [profitInput, setProfitInput] = useState("1000");

  useEffect(() => {
    if (!plans.length) {
      return;
    }
    const exists = plans.some((item) => item.id === selectedPlanId);
    if (!exists) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  const plan = useMemo(
    () => plans.find((item) => item.id === selectedPlanId) ?? plans[0] ?? null,
    [plans, selectedPlanId],
  );

  // Hooks must be called before any early returns
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });

  if (!hasPlans || !plan) {
    return null;
  }

  const profitValue = Number.parseFloat(profitInput.replace(",", "."));
  const safeProfit =
    Number.isFinite(profitValue) && profitValue > 0 ? profitValue : 0;

  const traderSplit = parseProfitSplit(plan.profitSplit) ?? 80;
  const firmSplit = 100 - traderSplit;

  const traderPayout = roundTwoDecimals(safeProfit * (traderSplit / 100));
  const firmPayout = roundTwoDecimals(safeProfit * (firmSplit / 100));

  const cashbackPoints =
    cashbackRate && cashbackRate > 0
      ? roundTwoDecimals(
          convertCurrency(plan.price, plan.currency, "USD", rates) *
            (cashbackRate / 100),
        )
      : null;
  const cashbackLocalized =
    cashbackPoints !== null
      ? convertCurrency(cashbackPoints, "USD", currency, rates)
      : null;

  function handleProfitChange(value: string) {
    if (/^\d*(?:[.,]\d{0,2})?$/.test(value)) {
      setProfitInput(value);
    }
  }

  return (
    <section ref={sectionAnim.ref} className={`space-y-6 rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-6 shadow-xs ${sectionAnim.className}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Kalkulator wypłaty</h2>
          <p className="text-sm text-muted-foreground">
            Oszacuj kwote, ktora trafia na Twoje konto po podziale z partnerem,
            oraz ile punktow cashback mozesz odebrac po zakupie planu.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex flex-col text-xs uppercase text-muted-foreground">
            Plan
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="mt-1 rounded-lg border border-border/60 bg-card/72 backdrop-blur-[36px]! px-3 py-2 text-sm font-semibold text-foreground shadow-xs focus-visible:ring-2 focus-visible:ring-ring">
                <SelectValue placeholder="Wybierz plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col text-xs uppercase text-muted-foreground">
            Zysk brutto ({plan.currency})
            <Input
              inputMode="decimal"
              value={profitInput}
              onChange={(event) => handleProfitChange(event.target.value)}
              variant="premium"
              className="mt-1"
              placeholder="1000"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard
          title="Kwota dla tradera"
          amount={formatCurrencyLocalized(
            convertCurrency(traderPayout, plan.currency, currency, rates),
            currency,
          )}
          hint={`Wyliczona przy podziale ${traderSplit}/${firmSplit}.`}
        />
        <SummaryCard
          title="Kwota dla firmy"
          amount={formatCurrencyLocalized(
            convertCurrency(firmPayout, plan.currency, currency, rates),
            currency,
          )}
          hint="Pozostaje u partnera po rozliczeniu."
        />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-4 shadow-xs text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Jak obliczamy wynik?</p>
        <ul className="mt-3 space-y-2">
          <CalculatorHint>
            Wpisz orientacyjny zysk netto z konta funded, aby zobaczyc wyplate po
            podziale.
          </CalculatorHint>
          <CalculatorHint>
            Podzial wyliczamy na podstawie deklarowanego splitu planu (
            {plan.profitSplit ?? "brak danych"}).
          </CalculatorHint>
          <CalculatorHint>
            Cashback:{" "}
            {cashbackPoints !== null && cashbackLocalized !== null
              ? `${formatCurrencyLocalized(
                  cashbackLocalized,
                  currency,
                )} (~${cashbackPoints.toLocaleString("pl-PL", {
                  maximumFractionDigits: 2,
                })} pkt, stawka ${cashbackRate ?? 0}%)`
              : "brak informacji od partnera"}
            .
          </CalculatorHint>
        </ul>
      </div>
    </section>
  );
}

function SummaryCard({
  title,
  amount,
  hint,
}: {
  title: string;
  amount: string;
  hint: string;
}) {
  return (
    <div className="group rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-4 shadow-xs transition-all hover:border-primary/50 hover:shadow-sm-lg">
      <p className="text-xs uppercase text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{amount}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function CalculatorHint({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <PremiumIcon icon={Check} variant="glow" size="sm" className="mt-0.5 text-emerald-600" />
      <span>{children}</span>
    </li>
  );
}

function parseProfitSplit(split: string | null | undefined) {
  if (!split) {
    return null;
  }
  const match = /^(\d{1,3})/.exec(split);
  if (!match) {
    return null;
  }
  const value = Number.parseInt(match[1], 10);
  if (!Number.isFinite(value) || value <= 0 || value > 100) {
    return null;
  }
  return value;
}

function roundTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}
