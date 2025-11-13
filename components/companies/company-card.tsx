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
    <Card
      className={cn(
        "group flex h-full flex-col justify-between overflow-hidden transition-colors",
        isTopRated ? "border-primary/50 hover:border-primary/70 hover:shadow-lg" : "hover:border-primary/50 hover:shadow-md",
      )}
    >
      <CardContent className="flex h-full flex-col justify-between space-y-[clamp(1.25rem,1.8vw,1.75rem)] p-[clamp(1.5rem,2vw,1.85rem)]">
        <div className="space-y-[clamp(1.25rem,1.8vw,1.75rem)]">
          <div className="flex items-start justify-between gap-[clamp(1rem,1.4vw,1.35rem)]">
            <div className="space-y-[clamp(0.6rem,0.9vw,0.85rem)]">
              <div className="flex flex-wrap items-center gap-[clamp(0.65rem,1vw,0.9rem)]">
                <h3 className="text-[clamp(1.1rem,0.6vw+0.95rem,1.35rem)] font-semibold text-foreground">
                {company.name}
              </h3>
                {isTopRated ? (
                  <Award className="h-[clamp(1.2rem,0.4vw+1.1rem,1.35rem)] w-[clamp(1.2rem,0.4vw+1.1rem,1.35rem)] text-amber-500" />
                ) : null}
              {company.discountCode ? (
                  <PremiumBadge variant="gradient" className="fluid-badge font-semibold uppercase tracking-wide">
                  {company.discountCode}
                </PremiumBadge>
              ) : null}
            </div>
              <p className="fluid-copy text-muted-foreground line-clamp-2">
              {company.shortDescription ?? "Aktualne dane o planach fundingowych."}
            </p>
              <div className="flex flex-wrap items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground/80 fluid-caption uppercase tracking-[0.18em]">
              {company.country ? <span>{company.country}</span> : null}
              {company.foundedYear ? <span>Od {company.foundedYear}</span> : null}
              {company.payoutFrequency ? <span>{company.payoutFrequency}</span> : null}
            </div>
          </div>
            <div className="flex flex-col items-end gap-[clamp(0.65rem,1vw,0.9rem)]">
              <PremiumBadge variant="glow" className="fluid-badge gap-[clamp(0.5rem,0.8vw,0.7rem)] font-semibold">
              <PremiumIcon icon={Star} variant="glow" size="sm" hoverGlow />
              {hasRating ? company.rating?.toFixed(1) : "Nowość"}
            </PremiumBadge>
              <div className="flex items-center gap-[clamp(0.6rem,0.9vw,0.85rem)]">
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
        </div>

        {primaryPlan ? (
          <div className="space-y-[clamp(0.75rem,1.2vw,1.1rem)] rounded-2xl border border-primary/20 bg-primary/5 p-[clamp(1rem,1.5vw,1.3rem)]">
            <p className="fluid-caption font-semibold uppercase tracking-[0.3em] text-primary">
              Najpopularniejszy plan
            </p>
            <div className="flex items-end justify-between gap-[clamp(1rem,1.4vw,1.35rem)]">
              <div className="space-y-[clamp(0.4rem,0.6vw,0.6rem)]">
                <p className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold text-foreground">
                  {primaryPlan.name}
                </p>
                <p className="fluid-caption text-muted-foreground">
                  {primaryPlan.evaluationModel === "instant-funding"
                    ? "Instant funding"
                    : primaryPlan.evaluationModel === "one-step"
                      ? "Jednoetapowe"
                      : "Dwuetapowe"}
                </p>
              </div>
              <div className="text-right fluid-caption text-muted-foreground">
                <p className="uppercase tracking-[0.18em]">Cena</p>
                <p className="text-[clamp(1.15rem,0.6vw+1rem,1.4rem)] font-semibold text-primary">
                  {convertedPrice !== null
                    ? formatCurrencyLocalized(convertedPrice, currency)
                    : `${primaryPlan.price.toLocaleString("pl-PL")}`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
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

        <div className="mt-[clamp(1.25rem,1.8vw,1.75rem)] flex flex-col gap-[clamp(0.75rem,1.2vw,1.1rem)] pt-[clamp(0.85rem,1.2vw,1.1rem)]">
          <div className="flex items-center gap-[clamp(0.6rem,0.9vw,0.85rem)] text-muted-foreground/80 fluid-caption uppercase tracking-[0.3em]">
          <PremiumIcon icon={ArrowUpRight} variant="gradient" size="default" hoverGlow />
          Szczegóły & cashback
        </div>
          <div className="flex flex-col gap-[clamp(0.75rem,1.2vw,1.1rem)] sm:flex-row sm:items-center">
            <Button asChild variant="premium" className="flex-1 rounded-full fluid-button">
            <Link href={`/firmy/${company.slug}`}>Profil firmy</Link>
          </Button>
          <PurchaseButton
              className="flex-1 rounded-full fluid-button"
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
