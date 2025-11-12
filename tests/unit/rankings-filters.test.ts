import assert from "node:assert/strict";
import test from "node:test";

import type { RankingFilters, RankingTabId } from "@/lib/types/rankings";
import {
  parseBooleanParam,
  parseFilters,
  parseNumberParam,
  parseStringParam,
  parseTabParam,
} from "@/app/rankingi/page";

test("parseStringParam picks first element, trims whitespace and rejects empty", () => {
  assert.equal(parseStringParam(undefined), null);
  assert.equal(parseStringParam(["alpha", "beta"]), "alpha");
  assert.equal(parseStringParam("  spaced  "), "spaced");
  assert.equal(parseStringParam(""), null);
});

test("parseNumberParam returns floored non-negative integers or null", () => {
  assert.equal(parseNumberParam("42"), 42);
  assert.equal(parseNumberParam("12.7"), 12);
  assert.equal(parseNumberParam("-5"), 0);
  assert.equal(parseNumberParam("abc"), null);
  assert.equal(parseNumberParam(undefined), null);
});

test("parseBooleanParam recognises 'true' only", () => {
  assert.equal(parseBooleanParam("true"), true);
  assert.equal(parseBooleanParam("false"), false);
  assert.equal(parseBooleanParam("yes"), false);
  assert.equal(parseBooleanParam(undefined), null);
});

test("parseTabParam validates against allowed tab ids", () => {
  const expected: RankingTabId = "cashback";
  assert.equal(parseTabParam("cashback"), expected);
  assert.equal(parseTabParam("unknown"), null);
  assert.equal(parseTabParam(undefined), null);
});

test("parseFilters maps params to ranking filters shape", () => {
  const params = {
    search: "alpha",
    country: ["PL"],
    model: "two-step",
    account: "challenge",
    minReviews: "120",
    cashback: "true",
  } satisfies Record<string, string | string[]>;

  const result = parseFilters(params);

  const expected: RankingFilters = {
    search: "alpha",
    countries: ["PL"],
    evaluationModels: ["two-step"],
    accountTypes: ["challenge"],
    minReviews: 120,
    hasCashback: true,
  };

  assert.deepEqual(result, expected);
});

test("parseFilters keeps falsy entries undefined except for cashback flag", () => {
  const result = parseFilters({
    search: "",
    country: "",
    model: "",
    account: "",
    minReviews: "",
    cashback: "false",
  });

  assert.equal(result.search, undefined);
  assert.equal(result.countries, undefined);
  assert.equal(result.evaluationModels, undefined);
  assert.equal(result.accountTypes, undefined);
  assert.equal(result.minReviews, undefined);
  assert.equal(result.hasCashback, false);
});
