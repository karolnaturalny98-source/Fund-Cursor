import { formatCurrencyLocalized } from "@/lib/currency";
import type { HomeRankingTab, RankingCompanySnapshot } from "@/lib/types/rankings";

export function formatCompanyPrice(company: RankingCompanySnapshot): string {
  if (
    typeof company.maxPlanPrice === "number" &&
    Number.isFinite(company.maxPlanPrice)
  ) {
    return formatCurrencyLocalized(company.maxPlanPrice, "USD", "pl-PL");
  }
  return "—";
}

export function formatPayoutMetric(company: RankingCompanySnapshot): string {
  if (
    typeof company.cashbackPayoutHours === "number" &&
    Number.isFinite(company.cashbackPayoutHours)
  ) {
    return `${Math.max(1, Math.round(company.cashbackPayoutHours))}h`;
  }

  if (
    typeof company.scores?.payouts === "number" &&
    Number.isFinite(company.scores.payouts)
  ) {
    return `${company.scores.payouts.toFixed(1)} pkt`;
  }

  return "—";
}

export interface BuildCompanyHrefParams {
  intent: "primary" | "details";
  tabId: HomeRankingTab["id"];
  position: number;
}

export function buildCompanyHref(
  slug: string,
  params: BuildCompanyHrefParams,
): string {
  const query = new URLSearchParams({
    utm_source: "home-ranking",
    utm_medium: params.intent,
    utm_campaign: "rankings-tabs",
    tab: params.tabId,
    position: params.position.toString(),
  });
  return `/firmy/${slug}?${query.toString()}`;
}
