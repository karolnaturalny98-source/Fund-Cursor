import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getRankingsDataset } from "@/lib/queries/rankings";

const querySchema = z.object({
  search: z
    .string()
    .trim()
    .optional(),
  country: z.string().optional(),
  model: z.string().optional(),
  account: z.string().optional(),
  minReviews: z
    .string()
    .transform((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : undefined;
    })
    .optional(),
  hasCashback: z
    .string()
    .transform((value) => value === "true")
    .optional(),
});

export async function GET(request: NextRequest) {
  const entries = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(entries);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid query parameters",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { search, country, model, account, minReviews, hasCashback } = parsed.data;

  const dataset = await getRankingsDataset({
    search: search?.length ? search : undefined,
    countries: parseListParam(country),
    evaluationModels: parseListParam(model),
    accountTypes: parseListParam(account),
    minReviews,
    hasCashback,
  });

  return NextResponse.json(dataset, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

function parseListParam(value: string | undefined): string[] | undefined {
  if (!value) {
    return undefined;
  }
  const list = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return list.length ? list : undefined;
}
