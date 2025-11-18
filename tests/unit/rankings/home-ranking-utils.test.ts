import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

import type { RankingCompanySnapshot } from "@/lib/types/rankings";
import {
  buildCompanyHref,
  formatCompanyPrice,
  formatPayoutMetric,
} from "@/lib/rankings/home-ranking-utils";

const companyBase: RankingCompanySnapshot = {
  id: "c1",
  name: "Test Firm",
  slug: "test-firm",
  logoUrl: null,
  country: "PL",
  foundedYear: 2022,
  headline: "Najlepsza firma",
  rating: 4.6,
  reviewCount: 100,
  averageRating: 4.6,
  recommendedRatio: 0.8,
  favoritesCount: 1200,
  newReviews30d: 12,
  clicks30d: 400,
  clicksPrev30d: 350,
  trendRatio: 14.5,
  cashbackAveragePoints: null,
  cashbackRedeemRate: null,
  cashbackPayoutHours: 36,
  hasCashback: true,
  evaluationModels: ["2-step"],
  accountTypes: ["swing"],
  maxProfitSplit: 90,
  categoryScores: {
    tradingConditions: 82,
    customerSupport: 80,
    userExperience: 79,
    payoutExperience: 78,
  },
  scores: {
    overall: 88,
    conditions: 86,
    payouts: 84,
    community: 80,
    cashback: 90,
    growth: 76,
  },
  discountCode: "FR10",
  cashbackRate: 15,
  maxPlanPrice: 199,
};

describe("home-ranking-utils", () => {
  it("formatCompanyPrice zwraca sformatowana kwote USD", () => {
    const value = formatCompanyPrice(companyBase);
    assert.equal(value, "199,00\u00A0USD");
  });

  it("formatCompanyPrice zwraca kreske, gdy brak danych", () => {
    const value = formatCompanyPrice({ ...companyBase, maxPlanPrice: null });
    assert.equal(value, "—");
  });

  it("formatPayoutMetric preferuje deklarowane godziny", () => {
    const value = formatPayoutMetric(companyBase);
    assert.equal(value, "36h");
  });

  it("formatPayoutMetric spada do wyniku punktowego", () => {
    const value = formatPayoutMetric({
      ...companyBase,
      cashbackPayoutHours: null,
      scores: { ...companyBase.scores, payouts: 91.234 },
    });
    assert.equal(value, "91.2 pkt");
  });

  it("buildCompanyHref dokleja parametry sledzace", () => {
    const href = buildCompanyHref("test-firm", {
      intent: "primary",
      tabId: "cashback",
      position: 3,
    });
    const url = new URL(`https://example.com${href}`);

    assert.equal(url.pathname, "/firmy/test-firm");
    assert.equal(url.searchParams.get("utm_source"), "home-ranking");
    assert.equal(url.searchParams.get("utm_medium"), "primary");
    assert.equal(url.searchParams.get("utm_campaign"), "rankings-tabs");
    assert.equal(url.searchParams.get("tab"), "cashback");
    assert.equal(url.searchParams.get("position"), "3");
  });
});
