"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star, Trophy, Medal } from "lucide-react";
import type { HomeRankingCompany } from "@/lib/queries/companies";
import { cn } from "@/lib/utils";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Button } from "@/components/ui/button";
import { DiscountCoupon } from "@/components/custom/discount-coupon";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

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
          className="h-11 w-11 rounded-2xl border border-border/60 bg-background/60 object-contain shadow-xs"
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
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-white/5 text-sm font-semibold text-primary shadow-xs">
      {initials}
    </div>
  );
}

function getCompanyHref(company: HomeRankingCompany): string {
  return `/firmy/${company.slug}`;
}

function getCompanyMeta(company: HomeRankingCompany): string {
  const parts: string[] = [];
  if (company.country) parts.push(company.country);
  if (company.foundedYear) parts.push(`od ${company.foundedYear}`);
  return parts.join(" • ") || "Prop trading";
}

function RatingBadge({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
      <Star className="h-3 w-3 fill-primary text-primary" />
      {rating.toFixed(1)}
    </div>
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
  const cashbackAmount =
    hasCashback &&
    typeof company.maxPlanPriceUsd === "number" &&
    company.maxPlanPriceUsd > 0
      ? (company.maxPlanPriceUsd * company.cashbackRate) / 100
      : null;

  const cashbackDisplay = hasCashback
    ? cashbackAmount !== null
      ? `Cashback ${Math.round(company.cashbackRate)}% | $${cashbackAmount.toFixed(
          2,
        )}`
      : `Cashback ${Math.round(company.cashbackRate)}%`
    : null;

  const isTop3 = index < 3;
  const top3Class = isTop3
    ? index === 0
      ? "bg-amber-500/5 border-l-4 border-l-amber-500"
      : index === 1
        ? "bg-slate-400/5 border-l-4 border-l-slate-400"
        : "bg-amber-700/5 border-l-4 border-l-amber-700"
    : "";

  return (
    <TableRow
      className={`transition-all hover:bg-white/5 border-b border-border/40 ${top3Class}`}
    >
      <TableCell className="px-6 py-5 align-top text-sm font-semibold text-muted-foreground">
        <div className="flex items-center gap-2">
          {isTop3 && (
            index === 0 ? (
              <Trophy className="h-4 w-4 text-amber-500" />
            ) : (
              <Medal className="h-4 w-4 text-slate-400" />
            )
          )}
          #{index + 1}
        </div>
      </TableCell>
      <TableCell className="px-6 py-5 align-top text-sm">
        <div className="flex items-center gap-3">
          <CompanyAvatar name={company.name} logoUrl={company.logoUrl} priority={isTop3} />
          <div className="flex flex-col">
            <Link
              href={profileHref}
              prefetch={false}
              className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {company.name}
            </Link>
            <p className="text-xs text-muted-foreground">{meta}</p>
            {cashbackDisplay ? (
              <p className="text-xs font-medium text-primary">{cashbackDisplay}</p>
            ) : null}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-6 py-5 align-top text-sm">
        <RatingBadge rating={company.rating} />
      </TableCell>
      <TableCell className="px-6 py-5 align-top text-sm text-muted-foreground">
        {company.reviewCount.toLocaleString("pl-PL")} opinii
      </TableCell>
      <TableCell className="px-6 py-5 align-top text-sm">
        {hasCashback ? (
          <PremiumBadge variant="glow" className="w-fit text-xs font-semibold">
            {Math.round(company.cashbackRate)}%
          </PremiumBadge>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="px-6 py-5 align-top text-sm">
        <DiscountCoupon code={company.discountCode} slug={company.slug} />
      </TableCell>
      <TableCell className="px-6 py-5 align-top text-sm">
        <Button
          asChild
          variant="premium-outline"
          className="w-full justify-center rounded-full px-4"
        >
          <Link href={profileHref} prefetch={false}>
            Przejdź
            <PremiumIcon icon={ArrowUpRight} variant="glow" size="sm" className="ml-1" hoverGlow />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function HomeRankingTable({ companies }: HomeRankingTableProps) {
  const companiesToShow = companies.slice(0, 10);

  if (companiesToShow.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Brak firm do wyświetlenia.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-full table-fixed" aria-label="Ranking premium">
          <TableHeader className="bg-card/48">
            <TableRow className="border-b border-border/40">
              <TableHead className="w-16 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                #
              </TableHead>
              <TableHead className="w-72 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Firma
              </TableHead>
              <TableHead className="w-32 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ocena
              </TableHead>
              <TableHead className="w-32 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Opinie
              </TableHead>
              <TableHead className="w-40 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cashback
              </TableHead>
              <TableHead className="w-40 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Kod zniżkowy
              </TableHead>
              <TableHead className="w-36 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Akcje
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-sm text-foreground">
            {companiesToShow.map((company, index) => (
              <CompanyRow key={company.id} company={company} index={index} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
