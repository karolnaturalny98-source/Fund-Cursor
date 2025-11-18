import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ArrowUpRight, BadgePercent, TrendingUp, ShieldCheck } from "lucide-react";

import { Section } from "@/components/layout/section";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCurrencyLocalized } from "@/lib/currency";
import type { TopCashbackCompany } from "@/lib/types";

interface TopCashbackSectionProps {
  companies: TopCashbackCompany[];
}

export function TopCashbackSection({ companies }: TopCashbackSectionProps) {
  if (!companies.length) {
    return null;
  }

  const sortedByRate = [...companies].sort(
    (a, b) => b.cashbackRate - a.cashbackRate,
  );
  const sortedByMaxValue = [...companies].sort(
    (a, b) => b.maxCashback - a.maxCashback,
  );
  const sortedByEntry = [...companies].sort((a, b) => {
    const aPrice = a.minPlanPrice ?? Number.POSITIVE_INFINITY;
    const bPrice = b.minPlanPrice ?? Number.POSITIVE_INFINITY;
    return aPrice - bPrice;
  });

  const bestRate = sortedByRate[0];
  const highestUsd = sortedByMaxValue[0];
  const lowestEntry = sortedByEntry[0] ?? bestRate;
  const averageRate =
    companies.reduce((sum, company) => sum + company.cashbackRate, 0) /
    companies.length;
  const totalPotential = companies.reduce(
    (sum, company) => sum + company.maxCashback,
    0,
  );

  const carouselCompanies = [...companies, ...companies];
  const compareCompanies = sortedByRate.slice(0, 3);

  const summaryItems = [
    {
      label: "Średni cashback",
      value: `${averageRate.toFixed(1)}%`,
      icon: BadgePercent,
      tooltip: "Średnia ważona wszystkich firm z ostatnich 24h",
    },
    {
      label: "Najwyższy cashback",
      value: `${bestRate.cashbackRate.toFixed(0)}%`,
      icon: ArrowUpRight,
      tooltip: `${bestRate.name} • kod ${bestRate.discountCode ?? "po kliknięciu"}`,
    },
    {
      label: "Najwyższy zwrot",
      value: formatCashbackValue(highestUsd.maxCashback),
      icon: TrendingUp,
      tooltip: `${highestUsd.name} • plan od ${formatPlanValue(highestUsd.minPlanPrice)}`,
    },
    {
      label: "Najniższe wejście",
      value: formatPlanValue(lowestEntry.minPlanPrice),
      icon: ShieldCheck,
      tooltip: `${lowestEntry.name} • cashback ${lowestEntry.cashbackRate.toFixed(0)}%`,
    },
  ];

  const metaItems = [
    `${averageRate.toFixed(1)}% avg`,
    `${companies.length} firm`,
    `${formatCashbackValue(totalPotential)} max zwrot`,
    `${bestRate.cashbackRate.toFixed(0)}% kod`,
  ];

  return (
    <Section size="lg" stack="lg" className="relative flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/85 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Badge variant="outline" className="inline-flex items-center gap-2 rounded-full border-white/20 bg-black/70 px-4 py-1 text-[11px] uppercase tracking-[0.3em] text-white/80">
            Top Cashback (24h)
            <span className="inline-flex items-center gap-1 text-emerald-300">
              Live
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </span>
          </Badge>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-white lg:text-4xl">
              Najwyższe stawki cashbacku
            </h2>
            <p className="text-sm text-white/75 lg:text-base">
              Wybierz firmę, kliknij w kod i odbierz zwrot bez ręcznych ticketów.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/rankingi?tab=cashback"
            prefetch={false}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-full border border-white/20 bg-black/60 text-white hover:bg-black/40",
            )}
          >
            Pełny ranking
          </Link>
          <Link
            href="/kontakt"
            prefetch={false}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-full border border-white/20 bg-black/50 text-white/80 hover:text-white",
            )}
          >
            Zgłoś firmę
          </Link>
        </div>
      </div>

      <CashbackMetaBar items={metaItems} />
      <CashbackSummary items={summaryItems} />
      <CashbackCarousel companies={carouselCompanies} duration={Math.max(32, companies.length * 5)} />
      <CashbackCompare companies={compareCompanies} />
      <CashbackDock highlighted={bestRate} />
    </Section>
  );
}

function CashbackCarousel({
  companies,
  duration,
}: {
  companies: TopCashbackCompany[];
  duration: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/90 p-4">
      <div
        className="cashback-marquee-track flex min-w-[200%] gap-4"
        role="list"
        style={{ animationDuration: `${duration}s` } as CSSProperties}
      >
        {companies.map((company, index) => (
          <CashbackCard key={`${company.id}-${index}`} company={company} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent" />
    </div>
  );
}

function CashbackCard({ company }: { company: TopCashbackCompany }) {
  return (
    <div className="flex min-w-[240px] flex-col gap-3 rounded-3xl border border-white/15 bg-gradient-to-b from-black/80 to-black/60 p-4 text-white" role="listitem">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/50">
          {company.logoUrl ? (
            <Image
              src={company.logoUrl}
              alt={company.name}
              width={48}
              height={48}
              className="h-10 w-10 rounded-xl object-contain"
            />
          ) : (
            <span className="text-sm font-semibold uppercase">
              {getInitials(company.name)}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">{company.name}</p>
          <p className="text-xs text-white/60">
            Cashback {company.cashbackRate.toFixed(0)}%
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs">
          <BadgePercent className="h-3.5 w-3.5 text-emerald-300" />
          {formatCashbackValue(company.minCashback)} – {formatCashbackValue(company.maxCashback)}
        </span>
        <span className="text-xs text-white/60">
          Plan od {formatPlanValue(company.minPlanPrice)}
        </span>
      </div>
      <Link
        href={`/firmy/${company.slug}?utm_source=home-top-cashback&utm_medium=carousel`}
        prefetch={false}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "justify-between rounded-full border border-white/20 bg-black/60 text-sm text-white hover:bg-black/40",
        )}
      >
        Odbierz cashback
        <ArrowUpRight className="h-4 w-4" />
      </Link>
      <p className="text-xs text-white/60">
        Kod {company.discountCode ?? "ujawnia się po kliknięciu"}
      </p>
    </div>
  );
}

function CashbackCompare({ companies }: { companies: TopCashbackCompany[] }) {
  if (!companies.length) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/15 bg-black/85 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            Porównanie planów
          </p>
          <h3 className="text-xl font-semibold text-white">
            Najlepsze kombinacje cashback + koszt wejścia
          </h3>
        </div>
        <Link
          href="/rankingi?tab=cashback"
          prefetch={false}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-full border border-white/20 bg-black/60 text-white hover:bg-black/40",
                )}
        >
          Wiecej rankingów
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm text-white/80">
          <thead className="text-xs uppercase tracking-[0.3em] text-white/40">
            <tr>
              <th className="pb-3 pr-4 text-left font-medium">Firma</th>
              <th className="pb-3 pr-4 text-left font-medium">Cashback %</th>
              <th className="pb-3 pr-4 text-left font-medium">Zwrot USD</th>
              <th className="pb-3 pr-4 text-left font-medium">Plan od</th>
              <th className="pb-3 text-left font-medium">Kod</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-t border-white/10">
                <td className="py-3 pr-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{company.name}</span>
                    <span className="text-xs text-white/60">
                      {formatCashbackValue(company.minCashback)} – {formatCashbackValue(company.maxCashback)}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 font-semibold text-emerald-300">
                  {company.cashbackRate.toFixed(0)}%
                </td>
                <td className="py-3 pr-4">
                  {formatCashbackValue(company.maxCashback)}
                </td>
                <td className="py-3 pr-4">
                  {formatPlanValue(company.minPlanPrice)}
                </td>
                <td className="py-3">
                  {company.discountCode ?? (
                    <span className="text-xs text-white/50">Po kliknięciu</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CashbackDock({ highlighted }: { highlighted: TopCashbackCompany }) {
  return (
    <div className="sticky bottom-6 z-20 mt-10 flex flex-wrap gap-4 rounded-3xl border border-white/20 bg-black/90 p-4 text-sm text-white shadow-[0_25px_70px_rgba(0,0,0,0.55)] backdrop-blur">
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          Cashback ready
        </p>
        <p className="text-base font-semibold">
          {highlighted.name} • {highlighted.cashbackRate.toFixed(0)}% zwrotu
        </p>
        <p className="text-xs text-white/60">
          Kliknij, aby aktywować kod {highlighted.discountCode ?? "FundedRank"} i przypisać cashback do konta.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/firmy/${highlighted.slug}?utm_source=home-top-cashback&utm_medium=dock`}
          prefetch={false}
          className={cn(
            buttonVariants({ variant: "premium", size: "sm" }),
            "rounded-full px-6 text-sm font-semibold",
          )}
        >
          Aktywuj cashback
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Link>
        <Link
          href="/rankingi?tab=cashback"
          prefetch={false}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "rounded-full border border-white/20 bg-transparent px-4 text-sm text-white/80 hover:text-white",
          )}
        >
          Pełny ranking
        </Link>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function formatCashbackValue(value: number) {
  return formatCurrencyLocalized(value, "USD", "pl-PL");
}

function formatPlanValue(value: number | null) {
  if (typeof value !== "number") {
    return "—";
  }
  return formatCurrencyLocalized(value, "USD", "pl-PL");
}

interface SummaryItem {
  label: string;
  value: string;
  tooltip: string;
  icon: LucideIcon;
}

function CashbackSummary({ items }: { items: SummaryItem[] }) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-3 rounded-3xl border border-white/10 bg-black/75 p-3 text-white">
        {items.map((item) => (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-3 py-2 text-left">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-black/50">
                  <item.icon className="h-4 w-4 text-emerald-300" />
                </span>
                <div className="space-y-0.5">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                    {item.label}
                  </p>
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">
              {item.tooltip}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

function CashbackMetaBar({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-black/75 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/55">
      {items.map((item, index) => (
        <span key={item} className="inline-flex items-center gap-2">
          {index > 0 && <span className="text-white/30">•</span>}
          {item}
        </span>
      ))}
    </div>
  );
}
