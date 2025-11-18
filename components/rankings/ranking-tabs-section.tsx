"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Star,
  TrendingUp,
  BadgePercent,
  Banknote,
  Clock3,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import type { HomeRankingTab, RankingCompanySnapshot } from "@/lib/types/rankings";
import { cn } from "@/lib/utils";
import {
  buildCompanyHref,
  formatCompanyPrice,
  formatPayoutMetric,
} from "@/lib/rankings/home-ranking-utils";

export type RankingTabsSectionProps = {
  tabs: HomeRankingTab[];
  variant?: "home" | "full";
};

type MetricDefinition = {
  label: string;
  value: string;
  helper?: string;
  icon?: typeof Star;
};

export function RankingTabsSection({
  tabs,
  variant = "home",
}: RankingTabsSectionProps) {
  if (!tabs.length) {
    return null;
  }

  if (variant === "full") {
    return <FullRankingTabs tabs={tabs} />;
  }

  return <HomeRankingTabs tabs={tabs} />;
}

function HomeRankingTabs({ tabs }: { tabs: HomeRankingTab[] }) {
  const logClick = useAffiliateClickLogger("home_ranking_section");

  return (
    <Tabs defaultValue={tabs[0]?.id ?? ""} className="w-full">
      <div className="relative">
        <TabsList className="flex w-full flex-wrap gap-2 overflow-x-auto rounded-full border border-white/25 bg-black/70 p-1 pr-6">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition data-[state=active]:bg-white data-[state=active]:text-black"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <span className="pointer-events-none absolute right-0 top-0 h-full w-12 rounded-r-full bg-gradient-to-l from-black/80 to-transparent" />
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/70">{tab.description}</p>
            <Link
              href="/rankingi"
              prefetch={false}
              className="text-sm font-semibold text-white/80 transition hover:text-white"
            >
              Pelny ranking
              <ArrowRight className="ml-2 inline-block h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {tab.companies.map((company, index) => (
              <HomeRankingRow
                key={company.id}
                company={company}
                index={index}
                tabId={tab.id}
                onAffiliateClick={(intent) =>
                  logClick(company.slug, intent ?? "primary")
                }
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

function HomeRankingRow({
  company,
  index,
  tabId,
  onAffiliateClick,
}: {
  company: RankingCompanySnapshot;
  index: number;
  tabId: HomeRankingTab["id"];
  onAffiliateClick: (intent: "primary" | "details") => void;
}) {
  const metrics = buildRowMetrics(tabId, company);
  const trendValue =
    typeof company.trendRatio === "number" && Number.isFinite(company.trendRatio)
      ? `${company.trendRatio >= 0 ? "+" : ""}${company.trendRatio.toFixed(1)}%`
      : "—";
  const score =
    typeof company.scores?.overall === "number"
      ? company.scores.overall.toFixed(1)
      : "—";

  const affiliateHref = buildCompanyHref(company.slug, {
    intent: "primary",
    tabId,
    position: index + 1,
  });
  const detailsHref = buildCompanyHref(company.slug, {
    intent: "details",
    tabId,
    position: index + 1,
  });

  return (
    <article className="flex flex-col gap-5 rounded-3xl border border-white/20 bg-black/70 px-5 py-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-white/40">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold tracking-[0.2em]">
            #{index + 1}
          </div>
          <div className="flex items-center gap-3">
            <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
            <div className="space-y-0.5">
              <Link
                href={`/firmy/${company.slug}`}
                className="text-base font-semibold text-white transition hover:opacity-90"
                prefetch={false}
              >
                {company.name}
              </Link>
              <p className="text-xs text-white/60 line-clamp-1">
                {company.headline ?? company.country ?? "Globalny rynek"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
            Wynik {score}
          </span>
          <span className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-emerald-200">
            {company.discountCode ? `Kod ${company.discountCode}` : "Cashback ready"}
          </span>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <HomeRankingMetric key={metric.label} {...metric} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
        <HomeRankingSocialStat
          icon={Star}
          label="Srednia ocena"
          value={
            typeof company.averageRating === "number"
              ? company.averageRating.toFixed(1)
              : "—"
          }
        />
        <HomeRankingSocialStat
          icon={BadgePercent}
          label="Opinie"
          value={`${company.reviewCount.toLocaleString("pl-PL")}`}
        />
        <HomeRankingSocialStat
          icon={TrendingUp}
          label="Trend 30d"
          value={trendValue}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-white/65">
          Kliknij, aby przejsc przez monitorowany link affiliate. Cashback naliczymy po zakupie planu u partnera.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={affiliateHref}
            prefetch={false}
            className={cn(
              buttonVariants({ variant: "premium", size: "sm" }),
              "rounded-full px-6 text-sm font-semibold",
            )}
            onClick={() => onAffiliateClick("primary")}
            aria-label={`Przejdz do firmy ${company.name} i odbierz cashback`}
          >
            Odbierz cashback
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href={detailsHref}
            prefetch={false}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-full border border-white/20 bg-transparent px-4 text-sm text-white/80 hover:text-white",
            )}
            onClick={() => onAffiliateClick("details")}
            aria-label={`Szczegoly firmy ${company.name}`}
          >
            Szczegoly firmy
          </Link>
        </div>
      </div>
    </article>
  );
}

function buildRowMetrics(
  tabId: HomeRankingTab["id"],
  company: RankingCompanySnapshot,
): MetricDefinition[] {
  const metrics: MetricDefinition[] = [
    getPrimaryMetric(tabId, company),
    {
      label: "Cashback",
      value:
        typeof company.cashbackRate === "number"
          ? `${company.cashbackRate.toFixed(0)}%`
          : "—",
      helper: company.discountCode ? `Kod ${company.discountCode}` : "Zwrot po kliknieciu",
      icon: BadgePercent,
    },
    {
      label: "Cena planu",
      value: formatCompanyPrice(company),
      helper: company.accountTypes[0] ?? "Dowolny rachunek",
      icon: Banknote,
    },
  ];

  return metrics;
}

function getPrimaryMetric(
  tabId: HomeRankingTab["id"],
  company: RankingCompanySnapshot,
): MetricDefinition {
  switch (tabId) {
    case "cashback":
      return {
        label: "Priorytet rankingu",
        value:
          typeof company.cashbackRate === "number"
            ? `${company.cashbackRate.toFixed(0)}%`
            : "—",
        helper: "Zweryfikowany cashback FundedRank",
        icon: BadgePercent,
      };
    case "price":
      return {
        label: "Najtanszy plan",
        value: formatCompanyPrice(company),
        helper: company.evaluationModels[0] ?? "Dowolny model",
        icon: Banknote,
      };
    case "payouts":
      return {
        label: "Srednia wyplata",
        value: formatPayoutMetric(company),
        helper: "Deklarowane SLA partnera",
        icon: Clock3,
      };
    case "opinions":
      return {
        label: "Srednia ocena",
        value:
          typeof company.averageRating === "number"
            ? company.averageRating.toFixed(1)
            : "—",
        helper: `${company.reviewCount.toLocaleString("pl-PL")} opinii`,
        icon: Star,
      };
    default:
      return {
        label: "Wynik ogolny",
        value: company.scores?.overall
          ? company.scores.overall.toFixed(1)
          : "—",
        helper: "Model laczacy wyplaty, hype i reputacje",
        icon: TrendingUp,
      };
  }
}

function HomeRankingMetric({
  label,
  value,
  helper,
  icon: Icon,
}: MetricDefinition) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
      <div className="flex items-center gap-2">
        {Icon ? (
          <span className="rounded-full border border-white/20 bg-white/10 p-1.5">
            <Icon className="h-4 w-4 text-white/80" />
          </span>
        ) : null}
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">{label}</p>
      </div>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      {helper ? <p className="text-xs text-white/60">{helper}</p> : null}
    </div>
  );
}

function HomeRankingSocialStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1">
      <Icon className="h-3.5 w-3.5 text-white/80" />
      <span className="text-white/60">{label}:</span>
      <span className="font-semibold text-white">{value}</span>
    </span>
  );
}

function useAffiliateClickLogger(source: string) {
  return useCallback((companySlug: string, intent: string) => {
    const payload = JSON.stringify({
      companySlug,
      source: `${source}:${intent}`,
    });

    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/clicks", blob);
        return;
      }
    } catch (error) {
      console.error("Beacon click log failed", error);
    }

    fetch("/api/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // silent fallback
    });
  }, [source]);
}

function FullRankingTabs({ tabs }: { tabs: HomeRankingTab[] }) {
  return (
    <Tabs defaultValue={tabs[0]?.id ?? ""} className="w-full">
      <TabsList className="flex w-full flex-wrap gap-3 overflow-x-auto rounded-full border border-white/25 bg-black/60 p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition data-[state=active]:bg-white data-[state=active]:text-black"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/70">{tab.description}</p>
            <Button asChild variant="nav-ghost" className="text-sm font-semibold text-white">
              <Link href="/rankingi" prefetch={false}>
                Pelny ranking
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {tab.companies.map((company, index) => (
              <div
                key={company.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/25 bg-black/65 px-4 py-4 text-white transition hover:border-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold">
                      #{index + 1}
                    </div>
                    <div className="flex items-center gap-3">
                      <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
                      <div className="space-y-0.5">
                        <Link
                          href={`/firmy/${company.slug}`}
                          className="text-sm font-semibold text-white transition hover:opacity-90"
                          prefetch={false}
                        >
                          {company.name}
                        </Link>
                        <p className="text-xs text-white/60 line-clamp-1">
                          {company.headline ?? company.country ?? "Globalny rynek"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/70">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-white" />
                      {company.averageRating ? company.averageRating.toFixed(1) : "—"}
                      <span className="text-white/40">
                        • {company.reviewCount.toLocaleString("pl-PL")} opinii
                      </span>
                    </div>
                    <div className="font-semibold text-white">
                      {renderMetric(tab.id, company)}
                    </div>
                    <div className="font-semibold text-white/80">
                      Trend {company.trendRatio >= 0 ? "+" : ""}
                      {company.trendRatio.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">
                    cashback ready
                  </p>
                  <Button asChild size="sm" variant="ghost-dark" className="rounded-full px-4">
                    <Link href={`/firmy/${company.slug}`} prefetch={false}>
                      Przejdz z kodem
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

function CompanyLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    return (
      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/25 bg-black/40">
        <Image src={logoUrl} alt={name} fill className="object-contain" sizes="40px" />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 bg-black/50 text-xs font-semibold uppercase text-white">
      {name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")}
    </div>
  );
}

function renderMetric(tabId: string, company: RankingCompanySnapshot) {
  switch (tabId) {
    case "opinions":
      return <span>Srednia ocena: {company.averageRating ? company.averageRating.toFixed(2) : "—"}</span>;
    case "cashback":
      return <span>Cashback: {company.cashbackRate ? `${company.cashbackRate}%` : "—"}</span>;
    case "price":
      return <span>Od {formatCompanyPrice(company)}</span>;
    case "payouts":
      return <span>Wyplaty: {formatPayoutMetric(company)}</span>;
    default:
      return <span>Wynik: {company.scores?.overall.toFixed(1)}</span>;
  }
}
