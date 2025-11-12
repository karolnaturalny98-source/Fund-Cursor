import { NextResponse } from "next/server";

import { getCurrencyRates } from "@/lib/currency/rates";

export const revalidate = 43200;

export async function GET() {
  try {
  const { rates, updatedAt, source } = await getCurrencyRates();

  return NextResponse.json(
    {
      rates,
      updatedAt,
      source,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
      },
    },
  );
  } catch (error) {
    console.error("Failed to fetch currency rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch currency rates" },
      { status: 500 },
    );
  }
}
