import assert from "node:assert/strict";
import test from "node:test";

import type { RankingCompanySnapshot } from "@/lib/types/rankings";
import {
  clamp01,
  extractProfitSplit,
  matchesFilters,
  normalizeByMax,
  normalizeRating,
  normalizeTrend,
  scaleScore,
} from "@/lib/queries/rankings";

const baseCompany: RankingCompanySnapshot = {
  id: "company-1",
  name: "Alpha Prop",
  slug: "alpha-prop",
  logoUrl: null,
  country: "PL",
  foundedYear: 2021,
  headline: "Leading prop firm",
  rating: 4.8,
  reviewCount: 120,
  averageRating: 4.6,
  recommendedRatio: 0.82,
  favoritesCount: 340,
  newReviews30d: 25,
  clicks30d: 500,
  clicksPrev30d: 350,
  trendRatio: 0.24,
  cashbackAveragePoints: 45,
  cashbackRedeemRate: 0.72,
  cashbackPayoutHours: 36,
  hasCashback: true,
  evaluationModels: ["two-step"],
  accountTypes: ["challenge"],
  maxProfitSplit: 90,
  categoryScores: {
    tradingConditions: 4.4,
    customerSupport: 4.3,
    userExperience: 4.2,
    payoutExperience: 4.1,
  },
  scores: {
    overall: 88.5,
    conditions: 86.2,
    payouts: 80.4,
    community: 82.1,
    cashback: 78.9,
    growth: 75.6,
  },
};

function withCompany(overrides: Partial<RankingCompanySnapshot>) {
  return { ...baseCompany, ...overrides };
}

test("normalizeRating handles null and bounds", () => {
  assert.equal(normalizeRating(null), 0.5);
  assert.equal(normalizeRating(5), 1);
  assert.equal(normalizeRating(2.5), 0.5);
});

test("normalizeByMax handles zero max and caps at 1", () => {
  assert.equal(normalizeByMax(0, 0), 0);
  assert.equal(normalizeByMax(50, 200), 0.25);
  assert.equal(normalizeByMax(250, 200), 1);
});

test("normalizeTrend clamps ratios into 0-1 range", () => {
  assert.equal(normalizeTrend(0), 0.5);
  assert.equal(normalizeTrend(2), 1);
  assert.equal(normalizeTrend(-2), 0);
  assert.equal(normalizeTrend(Number.NaN), 0.5);
});

test("clamp01 guards invalid numbers", () => {
  assert.equal(clamp01(Number.NaN), 0);
  assert.equal(clamp01(-0.5), 0);
  assert.equal(clamp01(0.6), 0.6);
  assert.equal(clamp01(3), 1);
});

test("scaleScore clamps and rounds to one decimal", () => {
  assert.equal(scaleScore(-0.5), 0);
  assert.equal(scaleScore(0.876), 87.6);
  assert.equal(scaleScore(2), 100);
});

test("matchesFilters respects search criteria", () => {
  assert.equal(matchesFilters(baseCompany, {}), true);
  assert.equal(matchesFilters(baseCompany, { search: "alpha" }), true);
  assert.equal(matchesFilters(baseCompany, { search: "prop" }), true);
  assert.equal(matchesFilters(baseCompany, { search: "beta" }), false);
});

test("matchesFilters respects country and model filters", () => {
  assert.equal(matchesFilters(baseCompany, { countries: ["PL"] }), true);
  assert.equal(matchesFilters(baseCompany, { countries: ["US"] }), false);
  assert.equal(
    matchesFilters(baseCompany, { evaluationModels: ["two-step"] }),
    true,
  );
  assert.equal(
    matchesFilters(baseCompany, { evaluationModels: ["instant"] }),
    false,
  );
});

test("matchesFilters respects account, reviews and cashback filters", () => {
  assert.equal(
    matchesFilters(baseCompany, { accountTypes: ["challenge"] }),
    true,
  );
  assert.equal(
    matchesFilters(baseCompany, { accountTypes: ["instant"] }),
    false,
  );
  assert.equal(matchesFilters(baseCompany, { minReviews: 50 }), true);
  assert.equal(matchesFilters(baseCompany, { minReviews: 200 }), false);
  assert.equal(matchesFilters(baseCompany, { hasCashback: true }), true);
  const noCashback = withCompany({ hasCashback: false });
  assert.equal(matchesFilters(noCashback, { hasCashback: true }), false);
});

test("extractProfitSplit parses digits and ignores invalid input", () => {
  assert.equal(extractProfitSplit("80/20"), 80);
  assert.equal(extractProfitSplit("max 90% payout"), 90);
  assert.equal(extractProfitSplit(null), null);
  assert.equal(extractProfitSplit("no split data"), null);
});
