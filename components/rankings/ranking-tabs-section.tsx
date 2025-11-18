"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  BadgePercent,
  Clock3,
  Zap,
  Turtle,
  Check,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { HomeRankingTab, RankingCompanySnapshot } from "@/lib/types/rankings";
import { cn } from "@/lib/utils";
import { buildCompanyHref, formatCompanyPrice, formatPayoutMetric } from "@/lib/rankings/home-ranking-utils";

export type RankingTabsSectionProps = {
  tabs: HomeRankingTab[];
  variant?: "home" | "full";
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

  return <HomeRankingTabs tabs={tabs} variant={variant} />;
}

function HomeRankingTabs({
  tabs,
  variant = "home",
}: {
  tabs: HomeRankingTab[];
  variant?: "home" | "full";
}) {
  const logClick = useAffiliateClickLogger("home_ranking_section");
  const [accountTypeFilter, setAccountTypeFilter] = useState("");
  const [evaluationFilter, setEvaluationFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [cashbackFilter, setCashbackFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState(false);
  const [payoutSpeedFilter, setPayoutSpeedFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const accountTypeOptions = useMemo(() => {
    const values = new Set<string>();
    tabs.forEach((tab) =>
      tab.companies.forEach((company) =>
        company.accountTypes.forEach((type) => {
          if (type) {
            values.add(type);
          }
        }),
      ),
    );
    return Array.from(values);
  }, [tabs]);

  const evaluationModelOptions = useMemo(() => {
    const values = new Set<string>();
    tabs.forEach((tab) =>
      tab.companies.forEach((company) =>
        company.evaluationModels.forEach((model) => {
          if (model) {
            values.add(model);
          }
        }),
      ),
    );
    return Array.from(values);
  }, [tabs]);

  const countryOptions = useMemo(() => {
    const values = new Set<string>();
    tabs.forEach((tab) =>
      tab.companies.forEach((company) => {
        if (company.country) {
          values.add(company.country);
        }
      }),
    );
    return Array.from(values);
  }, [tabs]);

  const filteredTabs = useMemo(() => {
    const tier = CASHBACK_TIERS.find((item) => item.value === cashbackFilter);

    return tabs.map((tab) => ({
      ...tab,
      companies: tab.companies.filter((company) => {
        const matchesAccountType =
          !accountTypeFilter || company.accountTypes.includes(accountTypeFilter);
        const matchesEvaluation =
          !evaluationFilter || company.evaluationModels.includes(evaluationFilter);
        const matchesCountry =
          !countryFilter || (company.country ?? "") === countryFilter;
        const matchesCashback =
          !tier || (company.cashbackRate ?? 0) >= tier.min;
        const matchesVerified =
          !verifiedFilter || Boolean(company.cashbackRedeemRate);
        const matchesPayoutSpeed =
          !payoutSpeedFilter || getPayoutSpeed(company.cashbackPayoutHours).value === payoutSpeedFilter;

        return (
          matchesAccountType &&
          matchesEvaluation &&
          matchesCountry &&
          matchesCashback &&
          matchesVerified &&
          matchesPayoutSpeed
        );
      }),
    }));
  }, [
    tabs,
    accountTypeFilter,
    evaluationFilter,
    countryFilter,
    cashbackFilter,
    verifiedFilter,
    payoutSpeedFilter,
  ]);

  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");

  useEffect(() => {
    if (!filteredTabs.length) {
      setActiveTab("");
      return;
    }
    if (!filteredTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(filteredTabs[0].id);
    }
  }, [filteredTabs, activeTab]);

  const activeTabData = filteredTabs.find((tab) => tab.id === activeTab);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full border border-white/20 px-4 text-white/80 hover:border-white"
            onClick={() => setFiltersOpen((prev) => !prev)}
          >
            {filtersOpen ? "Ukryj filtry" : "Pokaż filtry"}
          </Button>
          <p className="text-sm text-white/70">
            {activeTabData?.description ?? tabs[0]?.description ?? ""}
          </p>
        </div>
        {variant !== "home" && (
          <Button asChild variant="nav-ghost" className="text-sm font-semibold text-white">
            <Link href="/rankingi" prefetch={false}>
              Zobacz ranking
              <ArrowRight className="ml-2 inline-block h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {filtersOpen && (
          <aside className="w-full lg:w-72">
            <div className="sticky top-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <RankingFilterColumn
                accountTypes={accountTypeOptions}
                evaluationModels={evaluationModelOptions}
                countries={countryOptions}
                cashbackTiers={CASHBACK_TIERS}
                filters={{
                  accountType: accountTypeFilter,
                  evaluationModel: evaluationFilter,
                  country: countryFilter,
                  cashback: cashbackFilter,
                  verified: verifiedFilter,
                  payoutSpeed: payoutSpeedFilter,
                }}
                onFiltersChange={({
                  accountType,
                  evaluationModel,
                  country,
                  cashback,
                  verified,
                  payoutSpeed,
                }) => {
                  if (accountType !== undefined) setAccountTypeFilter(accountType);
                  if (evaluationModel !== undefined) setEvaluationFilter(evaluationModel);
                  if (country !== undefined) setCountryFilter(country);
                  if (cashback !== undefined) setCashbackFilter(cashback);
                  if (verified !== undefined) setVerifiedFilter(verified);
                  if (payoutSpeed !== undefined) setPayoutSpeedFilter(payoutSpeed);
                }}
              />
            </div>
          </aside>
        )}

        <div className="flex-1">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}
            className="w-full"
          >
            <div className="relative">
              <TabsList className="flex w-full flex-wrap gap-2 overflow-x-auto">
                {filteredTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="relative flex items-center justify-center overflow-hidden rounded-[0.85rem] border border-white/20 bg-black/60 px-6 py-2 text-sm font-semibold text-white/70 transition-colors duration-200 hover:border-white/40 data-[state=inactive]:shadow-none data-[state=active]:border-emerald-200/60 data-[state=active]:bg-black/80 data-[state=active]:text-white data-[state=active]:shadow-[0_16px_40px_rgba(8,20,33,0.45)] data-[state=active]:after:absolute data-[state=active]:after:left-1/2 data-[state=active]:after:top-0 data-[state=active]:after:h-[2px] data-[state=active]:after:w-2/3 data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-transparent data-[state=active]:after:via-emerald-300 data-[state=active]:after:to-transparent data-[state=active]:after:opacity-90 data-[state=active]:after:content-['']"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <span className="pointer-events-none absolute right-0 top-0 h-full w-12 rounded-r-full bg-gradient-to-l from-black via-black/60 to-transparent" />
            </div>

            {filteredTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-6 space-y-4">
                {tab.companies.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-white/70">
                    Brak firm spełniających wybrane filtry. Zresetuj filtry, aby zobaczyć wszystkie firmy.
                  </div>
                ) : (
                  <div className="space-y-3">
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
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function RankingFilterColumn({
  accountTypes,
  evaluationModels,
  countries,
  cashbackTiers,
  filters,
  onFiltersChange,
}: {
  accountTypes: string[];
  evaluationModels: string[];
  countries: string[];
  cashbackTiers: CashbackTier[];
  filters: FilterValues;
  onFiltersChange: (values: Partial<FilterValues>) => void;
}) {
  return (
    <Accordion type="single" collapsible defaultValue="account"> 
      <AccordionItem value="account">
        <AccordionTrigger className="flex items-center justify-between text-sm font-semibold text-white">
          <span>Rodzaj konta</span>
          <span className="text-xs text-white/40">
            {filters.accountType || "wszystkie"}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <FilterSelect
            value={filters.accountType}
            onChange={(value) => onFiltersChange({ accountType: value })}
            options={accountTypes}
            placeholder="Wybierz typ konta"
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="evaluation">
        <AccordionTrigger className="flex items-center justify-between text-sm font-semibold text-white">
          <span>Rodzaj challenge’u</span>
          <span className="text-xs text-white/40">
            {filters.evaluationModel || "wszystkie"}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <FilterSelect
            value={filters.evaluationModel}
            onChange={(value) => onFiltersChange({ evaluationModel: value })}
            options={evaluationModels}
            placeholder="Wybierz model"
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="country">
        <AccordionTrigger className="flex items-center justify-between text-sm font-semibold text-white">
          <span>Kraj</span>
          <span className="text-xs text-white/40">
            {filters.country || "dowolny"}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <FilterSelect
            value={filters.country}
            onChange={(value) => onFiltersChange({ country: value })}
            options={countries}
            placeholder="Wybierz kraj"
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="cashback">
        <AccordionTrigger className="flex items-center justify-between text-sm font-semibold text-white">
          <span>Cashback</span>
          <span className="text-xs text-white/40">
            {cashbackTiers.find((tier) => tier.value === filters.cashback)?.label ?? "dowolny"}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <Select
            value={filters.cashback || ""}
            onValueChange={(value) => onFiltersChange({ cashback: value })}
          >
            <SelectTrigger className="w-full rounded-full border border-white/15 bg-black/60 px-3 py-2 text-xs font-semibold text-white/80">
              <SelectValue placeholder="Wybierz zakres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Dowolny</SelectItem>
              {cashbackTiers.map((tier) => (
                <SelectItem key={tier.value} value={tier.value}>
                  {tier.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="verified">
        <AccordionTrigger className="flex items-center justify-between text-sm font-semibold text-white">
          <span>Verified partner</span>
          <span className="text-xs text-white/40">
            {filters.verified ? "tak" : "nie"}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <Button
            variant={filters.verified ? "nav" : "ghost"}
            size="sm"
            className="w-full rounded-full border border-white/20"
            onClick={() => onFiltersChange({ verified: !filters.verified })}
          >
            {filters.verified ? "Tylko verified" : "Włącz verified"}
          </Button>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="payout">
        <AccordionTrigger className="flex items-center justify-between text-sm font-semibold text-white">
          <span>Szybkość wypłat</span>
          <span className="text-xs text-white/40">
            {filters.payoutSpeed || "dowolna"}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-wrap gap-2">
            {PAYOUT_SPEED_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={filters.payoutSpeed === option.value ? "solid" : "ghost"}
                size="sm"
                className="rounded-full border border-white/20 px-3 text-xs text-white"
                onClick={() => onFiltersChange({ payoutSpeed: option.value })}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

const FILTER_CLEAR_VALUE = "__all__";

type FilterValues = {
  accountType: string;
  evaluationModel: string;
  country: string;
  cashback: string;
  verified: boolean;
  payoutSpeed: string;
};

type CashbackTier = {
  value: string;
  label: string;
  min: number;
};

const CASHBACK_TIERS: CashbackTier[] = [
  { value: "gte15", label: ">= 15%", min: 15 },
  { value: "gte10", label: ">= 10%", min: 10 },
  { value: "gte5", label: ">= 5%", min: 5 },
];

const PAYOUT_SPEED_OPTIONS = [
  { value: "fast", label: "Fast payouts" },
  { value: "normal", label: "Normal payouts" },
  { value: "slow", label: "Slow payouts" },
];

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  const triggerValue = value || FILTER_CLEAR_VALUE;

  return (
    <Select
      value={triggerValue}
      onValueChange={(v) => onChange(v === FILTER_CLEAR_VALUE ? "" : v)}
    >
      <SelectTrigger className="w-full min-w-[160px] rounded-full border border-white/15 bg-black/60 px-3 py-2 text-xs font-semibold text-white/80 h-9">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="w-full max-w-[220px]">
        <SelectItem value={FILTER_CLEAR_VALUE}>Wszystkie</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
  const isTopRank = index === 0;
  const cashbackValue =
    typeof company.cashbackRate === "number"
      ? `${company.cashbackRate.toFixed(0)}%`
      : "—";
  const scoreValue =
    typeof company.scores?.overall === "number"
      ? company.scores.overall.toFixed(1)
      : "—";
  const priceValue = formatCompanyPrice(company);
  const ratingValue =
    typeof company.averageRating === "number"
      ? company.averageRating.toFixed(1)
      : "—";
  const reviewCount = company.reviewCount
    ? company.reviewCount.toLocaleString("pl-PL")
    : "0";
  const payoutLabel =
    typeof company.cashbackPayoutHours === "number"
      ? `${company.cashbackPayoutHours}h payout`
      : "Payout TBD";
  const accountTypeLabel = company.accountTypes[0] ?? "Dowolny typ";
  const evaluationTypeLabel = getEvaluationLabel(company.evaluationModels[0]);
  const discountLabel = company.discountCode
    ? `Kod ${company.discountCode}`
    : "Cashback ready";
  const trendRatio =
    typeof company.trendRatio === "number" && Number.isFinite(company.trendRatio)
      ? company.trendRatio
      : null;
  const trendIcon = trendRatio !== null && trendRatio >= 0 ? (
    <ArrowUpRight className="h-3 w-3" />
  ) : (
    <ArrowDownRight className="h-3 w-3" />
  );
  const trendColor =
    trendRatio === null
      ? "text-white/50"
      : trendRatio >= 0
      ? "text-emerald-300"
      : "text-rose-300";
  const cashbackProgress = Math.min(Math.max(company.cashbackRate ?? 0, 0), 100);
  const verifiedPartner = typeof company.cashbackRedeemRate === "number";
  const payoutSpeed = getPayoutSpeed(company.cashbackPayoutHours);
  const challengeLabel =
    typeof company.recommendedRatio === "number"
      ? `Challenge ${company.recommendedRatio.toFixed(0)}%`
      : "Challenge data";
  const uspCopy = company.headline ?? "Prosty onboarding i szybkie wypłaty";
  const countryInfo = getCountryDisplay(company.country, company.foundedYear);
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
    <article
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl border border-white/15 bg-[#05090f]/80 px-4 py-3 text-white transition duration-200",
        isTopRank
          ? "border-white/25 bg-gradient-to-br from-[#0b1321] via-[#111d30] to-[#060b14] shadow-[0_35px_70px_-30px_rgba(10,20,35,0.85)]"
          : "hover:-translate-y-px hover:border-white/30 hover:bg-white/5 hover:shadow-[0_22px_38px_-28px_rgba(10,20,33,0.65)]",
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-5">
        <div className="flex flex-1 min-w-0 gap-3">
          <CompanyLogo name={company.name} logoUrl={company.logoUrl} sizeClass="h-9 w-9" />
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <Link
                href={`/firmy/${company.slug}`}
                className={cn(
                  "max-w-full truncate transition hover:opacity-90",
                  isTopRank
                    ? "relative text-white after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-px after:bg-amber-200/70"
                    : "text-white/90",
                )}
                prefetch={false}
              >
                {company.name}
              </Link>
              <span className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-white/70">
                #{index + 1}
              </span>
              {isTopRank && (
                <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                  Top wybór
                </span>
              )}
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/70">
                Wynik: {scoreValue}
              </span>
            </div>
            {verifiedPartner && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-300/90">
                <Check className="h-3 w-3" />
                Verified partner
              </div>
            )}
            <div className="text-xs text-white/50">
              {countryInfo}
            </div>
            <p className="text-sm text-white/70 line-clamp-2">
              {uspCopy}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/60">
              <span className="rounded-md bg-white/5 px-2 py-0.5 font-semibold uppercase tracking-[0.2em] text-white/70">
                {evaluationTypeLabel}
              </span>
              <span className="rounded-md bg-white/5 px-2 py-0.5 font-semibold uppercase tracking-[0.2em] text-white/70">
                {accountTypeLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 min-w-0 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Cashback</p>
              <p className="text-2xl font-semibold text-emerald-300">{cashbackValue}</p>
            </div>
          </div>
          <div className="h-1.5 w-[60px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-emerald-400"
              style={{ width: `${cashbackProgress}%` }}
            />
          </div>
          <p className="text-sm font-semibold text-white/90">Plan od {priceValue}</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/65">
            <FeaturePill
              icon={<Star className="h-3 w-3 text-amber-300" />}
              label={`${ratingValue} (${reviewCount} opinii)`}
            />
            <FeaturePill icon={payoutSpeed.icon} label={payoutLabel} />
            <FeaturePill icon={<BadgePercent className="h-3 w-3" />} label={challengeLabel} />
          </div>
          <div className={cn(
            "mt-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em]",
            trendColor,
          )}>
            {trendIcon}
            Trend 30d {trendRatio !== null ? `${trendRatio >= 0 ? "+" : ""}${trendRatio.toFixed(1)}%` : "—"}
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-2 pt-2 text-sm lg:w-auto lg:items-end lg:justify-center lg:pt-4">
          <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
            {discountLabel}
          </span>
          <div className="w-full lg:w-auto">
            <Link
              href={affiliateHref}
              prefetch={false}
              onClick={() => onAffiliateClick("primary")}
              aria-label={`Przejdz do firmy ${company.name} i odbierz cashback`}
              className="relative inline-flex h-11 w-full items-center justify-center overflow-hidden rounded-[0.8rem] p-[1px] text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[-130%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#34d399_0%,#0ea5e9_50%,#34d399_100%)] opacity-70"
              />
              <span className="relative inline-flex h-full w-full items-center justify-center rounded-[0.65rem] bg-[#050b13] px-5 py-2 text-sm font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-colors duration-200 hover:bg-transparent">
                Odbierz cashback
              </span>
            </Link>
          </div>
          <Link
            href={detailsHref}
            prefetch={false}
            className="text-xs font-semibold text-white/60 transition hover:text-white"
            onClick={() => onAffiliateClick("details")}
          >
            Szczegóły / Recenzja
          </Link>
        </div>
      </div>
    </article>
  );
}

function FeaturePill({
  icon,
  label,
}: {
  icon?: ReactNode;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70">
      {icon}
      {label}
    </span>
  );
}

function getEvaluationLabel(model?: string | null) {
  switch (model) {
    case "one-step":
      return "1-step";
    case "two-step":
      return "2-step";
    case "instant":
      return "Instant funded";
    default:
      return model ? model : "Typ konta";
  }
}

function getPayoutSpeed(hours?: number | null) {
  if (typeof hours !== "number" || Number.isNaN(hours)) {
    return {
      icon: <Clock3 className="h-3 w-3" />,
      label: "Payout unknown",
      value: "unknown",
    };
  }

  if (hours <= 24) {
    return { icon: <Zap className="h-3 w-3" />, label: "Fast payouts", value: "fast" };
  }

  if (hours <= 72) {
    return { icon: <Clock3 className="h-3 w-3" />, label: "Normal payouts", value: "normal" };
  }

  return { icon: <Turtle className="h-3 w-3" />, label: "Slow payouts", value: "slow" };
}

function getCountryDisplay(country?: string | null, foundedYear?: number | null) {
  const flag = getFlagEmoji(country);
  const countryName = country ?? "Globalny rynek";
  const year = foundedYear ? ` • ${foundedYear}` : "";
  return `${flag ? `${flag} ` : ""}${countryName}${year}`;
}

function getFlagEmoji(country?: string | null) {
  if (!country) return "";
  const code = country
    .slice(0, 2)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  if (code.length < 2) {
    return "";
  }

  const first = code.codePointAt(0)! - 65 + 0x1f1e6;
  const second = code.codePointAt(1)! - 65 + 0x1f1e6;
  return String.fromCodePoint(first, second);
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
            className="relative flex items-center justify-center overflow-hidden rounded-full border border-transparent px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:border-white/30 data-[state=active]:border-white/40 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[0_10px_25px_rgba(8,20,30,0.35)] data-[state=active]:after:absolute data-[state=active]:after:left-1/2 data-[state=active]:after:top-0 data-[state=active]:after:h-[2px] data-[state=active]:after:w-2/3 data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-transparent data-[state=active]:after:via-emerald-300 data-[state=active]:after:to-transparent data-[state=active]:after:content-['']"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/70">{tab.description}</p>
        <Link
          href="/rankingi"
          prefetch={false}
          className="text-sm font-semibold text-white/80 transition hover:text-white"
        >
          Zobacz ranking
          <ArrowRight className="ml-2 inline-block h-4 w-4" />
        </Link>
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

function CompanyLogo({
  name,
  logoUrl,
  sizeClass = "h-10 w-10",
}: {
  name: string;
  logoUrl: string | null;
  sizeClass?: string;
}) {
  if (logoUrl) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg border border-white/25 bg-black/40", sizeClass)}>
        <Image src={logoUrl} alt={name} fill className="object-contain" sizes="40px" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center rounded-lg border border-white/25 bg-black/50 text-xs font-semibold uppercase text-white", sizeClass)}>
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
