"use client";

import { memo, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, Percent, Star } from "lucide-react";

import type { Company, CompanyPlan } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { FavoriteButton } from "@/components/companies/favorite-button";
import { CompareToggle } from "@/components/companies/compare-toggle";
import { PurchaseButton } from "@/components/companies/purchase-button";
import { useCurrency } from "@/app/providers/currency-client-provider";
import { convertCurrency, formatCurrencyLocalized } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface CompanyDirectoryRowProps {
  company: Company;
  index: number;
}

const evaluationLabels: Record<CompanyPlan["evaluationModel"], string> = {
  "one-step": "Jednoetapowe wyzwanie",
  "two-step": "Dwuetapowe wyzwanie",
  "instant-funding": "Instant funding",
};

function pickEntryPlan(plans: CompanyPlan[] | undefined): CompanyPlan | null {
  if (!plans || plans.length === 0) {
    return null;
  }

  return (
    [...plans].sort((a, b) => {
      if (!Number.isFinite(a.price) && !Number.isFinite(b.price)) {
        return 0;
      }
      if (!Number.isFinite(a.price)) {
        return 1;
      }
      if (!Number.isFinite(b.price)) {
        return -1;
      }
      return a.price - b.price;
    })[0] ?? null
  );
}

export const CompanyDirectoryRow = memo(function CompanyDirectoryRow({
  company,
  index,
}: CompanyDirectoryRowProps) {
  const { currency, rates } = useCurrency();
  const entryPlan = useMemo(
    () => pickEntryPlan(company.plans),
    [company.plans],
  );

  const convertedPrice =
    entryPlan && Number.isFinite(entryPlan.price)
      ? convertCurrency(entryPlan.price, entryPlan.currency, currency, rates)
      : null;

  const hasCashback =
    typeof company.cashbackRate === "number" && company.cashbackRate > 0;

  const fallbackWebsite =
    company.websiteUrl ??
    `https://www.google.com/search?q=${encodeURIComponent(company.name)}`;

  const badgeStats = [
    entryPlan?.profitSplit ? `Payout ${entryPlan.profitSplit}` : null,
    entryPlan?.maxDrawdown ? `DD ${entryPlan.maxDrawdown}%` : null,
    entryPlan?.maxDailyLoss ? `Daily loss ${entryPlan.maxDailyLoss}%` : null,
    entryPlan?.leverage ? `Leverage ${entryPlan.leverage}x` : null,
    entryPlan?.payoutCycleDays
      ? `Wypłata co ${entryPlan.payoutCycleDays} dni`
      : company.payoutFrequency ?? null,
  ].filter(Boolean) as string[];

  const logoContent = company.logoUrl ? (
    <Image
      src={company.logoUrl}
      alt={company.name}
      fill
      className="object-contain"
      sizes="64px"
    />
  ) : (
    <span className="text-sm font-semibold text-muted-foreground">
      {company.name.substring(0, 3).toUpperCase()}
    </span>
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/70 shadow-xs backdrop-blur-xl transition-all hover:border-primary/40",
        "p-5 md:p-6",
      )}
      style={{
        animationDelay: `${index * 40}ms`,
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-background/60">
              {logoContent}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/firmy/${company.slug}`}
                  className="text-base font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  {company.name}
                </Link>
                {company.discountCode ? (
                  <Badge variant="success" className="gap-1">
                    <Percent className="h-3.5 w-3.5" />
                    Kod {company.discountCode}
                  </Badge>
                ) : null}
                {hasCashback ? (
                  <Badge variant="success" className="gap-1">
                    Cashback {company.cashbackRate}%
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {company.shortDescription ??
                  "Sprawdź plany, zasady i cashback dostępny przez FundedRank."}
              </p>
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
                {company.country ? <span>{company.country}</span> : null}
                {company.foundedYear ? (
                  <span>od {company.foundedYear}</span>
                ) : null}
                {company.payoutFrequency ? (
                  <span>{company.payoutFrequency}</span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              {typeof company.rating === "number" ? (
                <>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Ocena
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {company.rating.toFixed(1)}
                    <span className="ml-1 text-sm text-muted-foreground">/5</span>
                  </p>
                </>
              ) : (
                <Badge variant="outline">Nowość</Badge>
              )}
            </div>
            <FavoriteButton
              companyId={company.id}
              companySlug={company.slug}
              initialFavorite={!!company.viewerHasFavorite}
              size="icon"
            />
            <CompareToggle slug={company.slug} size="icon" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <Star className="h-4 w-4 text-primary" />
              Plan bazowy
            </div>
            {entryPlan ? (
              <>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {entryPlan.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {evaluationLabels[entryPlan.evaluationModel]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      od
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {convertedPrice !== null
                        ? formatCurrencyLocalized(convertedPrice, currency)
                        : `${entryPlan.price.toLocaleString("pl-PL")} ${entryPlan.currency}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {badgeStats.length
                    ? badgeStats.map((badge) => (
                        <Badge
                          key={badge}
                          variant="outline"
                          className="border-dashed text-[0.7rem]"
                        >
                          {badge}
                        </Badge>
                      ))
                    : (
                        <span>Parametry dostępne w profilu firmy.</span>
                      )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Brak planu w bazie – sprawdź profil firmy, aby poznać szczegóły.
              </p>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-dashed border-border/50 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              Cashback
            </div>
            <div className="space-y-2">
              <Badge
                variant={hasCashback ? "success" : "outline"}
                className="w-fit gap-1 text-sm"
              >
                {hasCashback ? (
                  <>
                    Do {company.cashbackRate}% cashbacku
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </>
                ) : (
                  "Cashback po potwierdzeniu zakupu"
                )}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {hasCashback
                  ? "Kliknij w link z kodem, kup plan i zgłoś cashback w panelu FundedRank."
                  : "Wypełnij formularz cashbacku po zakupie, a damy znać gdy bonus będzie dostępny."}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border/40 p-4">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              CTA
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href={`/firmy/${company.slug}`}
                className={cn(buttonVariants({ variant: "secondary" }), "w-full rounded-full")}
              >
                Zobacz szczegóły
              </Link>
              <PurchaseButton
                companySlug={company.slug}
                href={fallbackWebsite}
                className="rounded-full"
                variant="premium"
              >
                Kup z kodem
                <ExternalLink className="ml-2 h-4 w-4" />
              </PurchaseButton>
              <p className="text-center text-[0.7rem] text-muted-foreground">
                Zgarnij cashback z naszego linka – kliknij przed zakupem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CompanyDirectoryRow.displayName = "CompanyDirectoryRow";
