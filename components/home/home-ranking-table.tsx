"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star, Trophy, Medal } from "lucide-react";
import type { HomeRankingCompany } from "@/lib/queries/companies";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscountCoupon } from "@/components/custom/discount-coupon";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Text } from "@/components/ui/text";

interface HomeRankingTableProps {
  companies: HomeRankingCompany[];
}

function CompanyAvatar({
  name,
  logoUrl,
  priority = false,
}: {
  name: string;
  logoUrl: string | null;
  priority?: boolean;
}) {
  if (logoUrl) {
    return (
      <div className="relative">
        <Image
          src={logoUrl}
          alt={name}
          width={44}
          height={44}
          sizes="44px"
          priority={priority}
          className="h-[clamp(2.25rem,2.4vw+1.9rem,2.9rem)] w-[clamp(2.25rem,2.4vw+1.9rem,2.9rem)] rounded-2xl border border-border/60 bg-background/60 object-contain shadow-xs"
        />
      </div>
    );
  }

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-[clamp(2.25rem,2.4vw+1.9rem,2.9rem)] w-[clamp(2.25rem,2.4vw+1.9rem,2.9rem)] items-center justify-center rounded-2xl border border-border/60 bg-white/5 font-semibold text-primary shadow-xs fluid-copy">
      {initials}
    </div>
  );
}

function getCompanyHref(company: HomeRankingCompany): string {
  return `/firmy/${company.slug}`;
}

const HEADER_CELL_CLASSES =
  "fluid-table-head text-left fluid-caption font-semibold uppercase tracking-[0.18em] text-muted-foreground";

function getCompanyMeta(company: HomeRankingCompany): string {
  const parts: string[] = [];
  if (company.country) parts.push(company.country);
  if (company.foundedYear) parts.push(`od ${company.foundedYear}`);
  return parts.join(" • ") || "Prop trading";
}

function RatingBadge({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="fluid-caption text-muted-foreground">-</span>;
  }
  return (
    <Badge variant="pill" className="gap-2 border-primary/30 bg-primary/10 text-primary fluid-caption font-semibold">
      <Star className="fluid-icon-sm fill-primary text-primary" />
      {rating.toFixed(1)}
    </Badge>
  );
}

function CompanyRow({
  company,
  index,
}: {
  company: HomeRankingCompany;
  index: number;
}) {
  const profileHref = getCompanyHref(company);
  const meta = getCompanyMeta(company);

  const hasCashback =
    typeof company.cashbackRate === "number" && company.cashbackRate > 0;
  const cashbackRate = company.cashbackRate ?? 0;
  const cashbackAmount =
    hasCashback &&
    typeof company.maxPlanPriceUsd === "number" &&
    company.maxPlanPriceUsd > 0
      ? (company.maxPlanPriceUsd * cashbackRate) / 100
      : null;

  const cashbackDisplay = hasCashback
    ? cashbackAmount !== null
      ? `Cashback ${Math.round(cashbackRate)}% | $${cashbackAmount.toFixed(
          2,
        )}`
      : `Cashback ${Math.round(cashbackRate)}%`
    : null;

  const isTop3 = index < 3;
  const top3Class = isTop3
    ? index === 0
      ? "bg-amber-500/5 border-s-4 border-amber-500/60"
      : index === 1
        ? "bg-slate-400/5 border-s-4 border-slate-400/60"
        : "bg-amber-700/5 border-s-4 border-amber-700/60"
    : "";

  return (
    <TableRow className={cn("border-b border-border/40 transition-colors hover:bg-card/40", top3Class)}>
      <TableCell className="fluid-table-cell align-top font-semibold text-muted-foreground fluid-copy">
        <div className="flex items-center gap-[clamp(0.4rem,0.7vw,0.65rem)]">
          {isTop3 && (
            index === 0 ? (
              <Trophy className="h-[clamp(0.9rem,0.6vw+0.7rem,1.1rem)] w-[clamp(0.9rem,0.6vw+0.7rem,1.1rem)] text-amber-500" />
            ) : (
              <Medal className="h-[clamp(0.9rem,0.6vw+0.7rem,1.1rem)] w-[clamp(0.9rem,0.6vw+0.7rem,1.1rem)] text-slate-400" />
            )
          )}
          #{index + 1}
        </div>
      </TableCell>
      <TableCell className="fluid-table-cell align-top">
        <div className="flex items-center gap-[clamp(0.75rem,1.1vw,1rem)]">
          <CompanyAvatar name={company.name} logoUrl={company.logoUrl} priority={isTop3} />
          <div className="flex flex-col">
            <Text
              asChild
              variant="body"
              weight="semibold"
              className="text-foreground transition-colors hover:text-primary"
            >
              <Link href={profileHref} prefetch={false}>
                {company.name}
              </Link>
            </Text>
            <Text variant="caption" tone="muted">
              {meta}
            </Text>
            {cashbackDisplay ? (
              <Text variant="caption" tone="primary" weight="semibold">
                {cashbackDisplay}
              </Text>
            ) : null}
          </div>
        </div>
      </TableCell>
      <TableCell className="fluid-table-cell align-top">
        <RatingBadge rating={company.rating} />
      </TableCell>
      <TableCell className="fluid-table-cell align-top text-muted-foreground fluid-caption">
        <Text asChild variant="caption" tone="muted" className="hidden sm:inline">
          <span>{company.reviewCount.toLocaleString("pl-PL")} opinii</span>
        </Text>
        <Text asChild variant="caption" tone="muted" className="sm:hidden">
          <span>{company.reviewCount.toLocaleString("pl-PL")}</span>
        </Text>
      </TableCell>
      <TableCell className="fluid-table-cell align-top">
        {hasCashback ? (
          <PremiumBadge variant="glow" className="w-fit fluid-badge font-semibold">
            {Math.round(cashbackRate)}%
          </PremiumBadge>
        ) : (
          <span className="fluid-caption text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="fluid-table-cell align-top">
        <DiscountCoupon code={company.discountCode} slug={company.slug} />
      </TableCell>
      <TableCell className="fluid-table-cell align-top">
        <Link
          href={profileHref}
          prefetch={false}
          className={cn(
            buttonVariants({ variant: "ghost-dark" }),
            "w-full justify-center rounded-full",
          )}
        >
          Przejdź
          <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="ml-1" hoverGlow />
        </Link>
      </TableCell>
    </TableRow>
  );
}

export function HomeRankingTable({ companies }: HomeRankingTableProps) {
  const companiesToShow = companies.slice(0, 10);

  if (companiesToShow.length === 0) {
    return (
      <Card variant="default" className="p-8 text-center">
        <Text variant="body" tone="muted">
          Brak firm do wyświetlenia.
        </Text>
      </Card>
    );
  }

  return (
    <Card variant="default" className="overflow-hidden">
      <div className="-mx-2 overflow-x-auto md:mx-0">
        <Table className="min-w-full table-fixed" aria-label="Ranking premium">
          <TableHeader className="bg-card/48">
            <TableRow className="border-b border-border/40">
              <TableHead className={`${HEADER_CELL_CLASSES} w-[clamp(3.5rem,5vw,4.75rem)]`}>#</TableHead>
              <TableHead className={`${HEADER_CELL_CLASSES} w-[clamp(12rem,26vw,20rem)]`}>
                Firma
              </TableHead>
              <TableHead className={`${HEADER_CELL_CLASSES} w-[clamp(8rem,14vw,10rem)]`}>
                Ocena
              </TableHead>
              <TableHead className={`${HEADER_CELL_CLASSES} w-[clamp(8rem,14vw,10rem)]`}>
                Opinie
              </TableHead>
              <TableHead className={`${HEADER_CELL_CLASSES} w-[clamp(9rem,16vw,12rem)]`}>
                Cashback
              </TableHead>
              <TableHead className={`${HEADER_CELL_CLASSES} w-[clamp(10rem,18vw,12.5rem)]`}>
                Kod zniżkowy
              </TableHead>
              <TableHead className={`${HEADER_CELL_CLASSES} w-[clamp(9rem,14vw,11rem)]`}>
                Akcje
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companiesToShow.map((company, index) => (
              <CompanyRow key={company.id} company={company} index={index} />
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
