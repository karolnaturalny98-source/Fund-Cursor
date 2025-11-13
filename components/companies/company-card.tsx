"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, Star, Award } from "lucide-react";

import type { Company } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "./favorite-button";
import { CompareToggle } from "./compare-toggle";
import { PurchaseButton } from "./purchase-button";
import { useCurrency } from "@/app/providers/currency-client-provider";
import { convertCurrency, formatCurrencyLocalized } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface CompanyCardProps {
  company: Company;
}

export const CompanyCard = memo(function CompanyCard({ company }: CompanyCardProps) {
  const { currency, rates } = useCurrency();
  const hasRating = typeof company.rating === "number";
  const isTopRated = company.rating !== null && company.rating >= 4.5;

  const primaryPlan = company.plans?.[0] ?? null;
  const convertedPrice = primaryPlan
    ? convertCurrency(primaryPlan.price, primaryPlan.currency, currency, rates)
    : null;

  return (
    <Card className={cn(
      "group flex h-full flex-col justify-between overflow-hidden",
      isTopRated 
        ? "border-primary/50 hover:border-primary/70 hover:shadow-lg" 
        : "hover:border-primary/50 hover:shadow-md"
    )}>
      <CardContent className="flex h-full flex-col justify-between space-y-5 p-6">
        <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground">
                {company.name}
              </h3>
              {isTopRated && (
                <Award className="h-5 w-5 text-amber-500" />
              )}
              {company.discountCode ? (
                <PremiumBadge variant="gradient" className="px-3 py-1">
                  {company.discountCode}
                </PremiumBadge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {company.shortDescription ?? "Aktualne dane o planach fundingowych."}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground/80">
              {company.country ? <span>{company.country}</span> : null}
              {company.foundedYear ? <span>Od {company.foundedYear}</span> : null}
              {company.payoutFrequency ? <span>{company.payoutFrequency}</span> : null}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PremiumBadge variant="glow" className="gap-2 px-3 py-1">
              <PremiumIcon icon={Star} variant="glow" size="sm" hoverGlow />
              {hasRating ? company.rating?.toFixed(1) : "Nowość"}
            </PremiumBadge>
            <div className="flex items-center gap-2">
              <FavoriteButton
                companyId={company.id}
                companySlug={company.slug}
                initialFavorite={!!company.viewerHasFavorite}
                size="icon"
              />
              <CompareToggle slug={company.slug} size="icon" />
            </div>
          </div>
        </div>

        {primaryPlan ? (
          <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Najpopularniejszy plan
            </p>
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {primaryPlan.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {primaryPlan.evaluationModel === "instant-funding"
                    ? "Instant funding"
                    : primaryPlan.evaluationModel === "one-step"
                      ? "Jednoetapowe"
                      : "Dwuetapowe"}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-xs uppercase text-muted-foreground">Cena</p>
                <p className="text-lg font-semibold text-primary">
                  {convertedPrice !== null
                    ? formatCurrencyLocalized(convertedPrice, currency)
                    : `${primaryPlan.price.toLocaleString("pl-PL")}`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {company.cashbackRate ? (
                <PremiumBadge variant="glow" className="rounded-full border-primary/30">
                  Cashback {company.cashbackRate}%
                </PremiumBadge>
              ) : null}
              {primaryPlan.maxDrawdown ? (
                <PremiumBadge variant="outline" className="rounded-full border-primary/30">
                  DD {primaryPlan.maxDrawdown.toLocaleString("pl-PL")}
                </PremiumBadge>
              ) : null}
              {primaryPlan.profitTarget ? (
                <PremiumBadge variant="outline" className="rounded-full border-primary/30">
                  Target {primaryPlan.profitTarget.toLocaleString("pl-PL")}
                </PremiumBadge>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 pt-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground/80">
          <PremiumIcon icon={ArrowUpRight} variant="gradient" size="default" hoverGlow />
          Szczegóły & cashback
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="premium" className="flex-1 rounded-full">
            <Link href={`/firmy/${company.slug}`}>Profil firmy</Link>
          </Button>
          <PurchaseButton
            className="flex-1 rounded-full"
            companySlug={company.slug}
            href={company.websiteUrl ?? `https://www.google.com/search?q=${encodeURIComponent(company.name)}`}
            variant="premium-outline"
          >
            Strona partnera
            <PremiumIcon icon={ExternalLink} variant="glow" size="default" className="ml-2" hoverGlow />
          </PurchaseButton>
        </div>
        </div>
      </CardContent>
    </Card>
  );
});

CompanyCard.displayName = "CompanyCard";
