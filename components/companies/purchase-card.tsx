"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { CopyDiscountButton } from "@/components/companies/copy-discount-button";
import { PurchaseButton } from "@/components/companies/purchase-button";
import { useCurrency } from "@/app/providers/currency-client-provider";
import { convertCurrency, formatCurrencyLocalized } from "@/lib/currency";
import type { CompanyCopyMetrics, CompanyPlan } from "@/lib/types";

interface PurchaseCardProps {
  companySlug: string;
  discountCode: string | null | undefined;
  websiteUrl: string | null | undefined;
  cashbackRate: number | null | undefined;
  defaultPlan: Pick<CompanyPlan, "id" | "name" | "price" | "currency"> | null;
  copyMetrics: CompanyCopyMetrics | null;
}

export function PurchaseCard({
  companySlug,
  discountCode,
  websiteUrl,
  cashbackRate,
  defaultPlan,
  copyMetrics,
}: PurchaseCardProps) {
  const { currency, rates } = useCurrency();
  const [showChecklist, setShowChecklist] = useState(false);
  const [weeklyCopyCount, setWeeklyCopyCount] = useState(
    copyMetrics?.last7d ?? 0,
  );
  const [dailyCopyCount, setDailyCopyCount] = useState(
    copyMetrics?.last24h ?? 0,
  );

  useEffect(() => {
    if (!showChecklist) {
      return;
    }
    const timer = setTimeout(() => setShowChecklist(false), 6000);
    return () => clearTimeout(timer);
  }, [showChecklist]);

  const code = discountCode ?? "BRAK";

  const cashbackEstimate = useMemo(() => {
    if (!cashbackRate || !defaultPlan) {
      return null;
    }
    const multiplier = cashbackRate / 100;
    const basePriceUsd = convertCurrency(
      defaultPlan.price,
      defaultPlan.currency,
      "USD",
      rates,
    );
    const points = Number.parseFloat((basePriceUsd * multiplier).toFixed(2));
    const localizedValue = convertCurrency(points, "USD", currency, rates);

    return {
      points,
      localizedValue,
    };
  }, [cashbackRate, currency, defaultPlan, rates]);

  const defaultPlanPricing = useMemo(() => {
    if (!defaultPlan) {
      return null;
    }
    const converted = convertCurrency(
      defaultPlan.price,
      defaultPlan.currency,
      currency,
      rates,
    );
    const formattedConverted = formatCurrencyLocalized(converted, currency);
    const showOriginal =
      defaultPlan.currency.toUpperCase() !== currency.toUpperCase();
    const originalLabel = `${defaultPlan.price.toLocaleString("pl-PL")} ${defaultPlan.currency}`;

    return {
      formattedConverted,
      showOriginal,
      originalLabel,
    };
  }, [currency, defaultPlan, rates]);

  function handleCopy() {
    setShowChecklist(true);
    setWeeklyCopyCount((value) => value + 1);
    setDailyCopyCount((value) => value + 1);
  }

  return (
    <aside className="glass-card sticky top-6 flex h-fit flex-col gap-4 p-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground">
          Kod rabatowy
        </p>
        <div className="flex items-center gap-2">
          <span className="rounded-xl border-2 border-primary/30 bg-linear-to-r from-primary/10 to-primary/5 px-4 py-2 font-mono text-sm font-semibold shadow-xs">
            {code}
          </span>
          {discountCode ? (
            <CopyDiscountButton
              slug={companySlug}
              code={code}
              onCopied={handleCopy}
            />
          ) : null}
        </div>
        {cashbackRate ? (
          <p className="text-sm text-muted-foreground">
            Cashback: <strong>{cashbackRate}%</strong> wartosci zakupu.
          </p>
        ) : null}
        {cashbackEstimate && defaultPlan ? (
          <p className="text-xs text-muted-foreground">
            Przy planie {defaultPlan.name}: zwrot{" "}
            <strong>
              {formatCurrencyLocalized(
                cashbackEstimate.localizedValue,
                currency,
              )}
            </strong>{" "}
            (~
            {cashbackEstimate.points.toLocaleString("pl-PL", {
              maximumFractionDigits: 2,
            })}
            {" "}
            pkt).
          </p>
        ) : null}
        {(weeklyCopyCount ?? 0) > 0 ? (
          <p className="text-xs text-muted-foreground">
            Ostatnio skopiowano: <strong>{weeklyCopyCount}</strong> razy w 7 dni
            (w tym {dailyCopyCount} dzis).
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Badz pierwsza osoba, ktora skopiuje ten kod w tym tygodniu.
          </p>
        )}
      </div>

      {showChecklist ? (
        <div className="glass-panel space-y-2 border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
          <p className="flex items-center gap-2 font-semibold">
            <PremiumIcon icon={CheckCircle} variant="glow" size="sm" className="text-emerald-600" />
            Kod skopiowany. Pamietaj:
          </p>
          <ul className="space-y-1">
            <li>1. Wklej kod w koszyku partnera.</li>
            <li>2. Zaloguj sie tym samym mailem co w FundedRank.</li>
            <li>3. Przeslij potwierdzenie w panelu cashback.</li>
          </ul>
        </div>
      ) : null}

      {defaultPlan ? (
        <div className="glass-panel relative overflow-hidden p-5">
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
          <p className="relative font-semibold text-foreground">Najpopularniejszy plan</p>
          <p className="relative mt-1 text-muted-foreground">{defaultPlan.name}</p>
          <div className="relative mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Cena</span>
            <span className="text-lg font-semibold text-foreground">
              {defaultPlanPricing
                ? defaultPlanPricing.formattedConverted
                : `${defaultPlan.price.toLocaleString("pl-PL")} ${defaultPlan.currency}`}
            </span>
          </div>
          {defaultPlanPricing?.showOriginal ? (
            <p className="relative mt-1 text-[11px] text-muted-foreground">
              ({defaultPlanPricing.originalLabel})
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Button asChild variant="premium-outline" className="w-full rounded-full">
          <Link href="#plany">Przejdz do planow</Link>
        </Button>
        {websiteUrl ? (
          <PurchaseButton companySlug={companySlug} href={websiteUrl}>
            Zakup z kodem
            <PremiumIcon icon={ExternalLink} variant="glow" size="sm" className="ml-2" />
          </PurchaseButton>
        ) : null}
      </div>
    </aside>
  );
}
