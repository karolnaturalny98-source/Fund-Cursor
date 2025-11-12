import { NextRequest, NextResponse } from "next/server";

import {
  DEFAULT_COMPANY_SUMMARY_PAGE_SIZE,
  MAX_COMPANY_SUMMARY_PAGE_SIZE,
  getCompanySummaries,
} from "@/lib/queries/companies";

function parsePositiveInteger(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const rawPage = parsePositiveInteger(searchParams.get("page"), 1);
    const rawPerPage = parsePositiveInteger(
      searchParams.get("perPage") ?? searchParams.get("limit"),
      DEFAULT_COMPANY_SUMMARY_PAGE_SIZE,
    );
    const perPage = Math.max(
      1,
      Math.min(rawPerPage, MAX_COMPANY_SUMMARY_PAGE_SIZE),
    );
    const page = Math.max(1, rawPage);
    const search = searchParams.get("search") ?? undefined;

    const { items, total } = await getCompanySummaries({
      page,
      perPage,
      search,
    });

    const totalPages = Math.max(1, Math.ceil(total / perPage));

  return NextResponse.json(
      {
        data: items,
        meta: {
          page,
          perPage,
          total,
          totalPages,
        },
      },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 },
    );
  }
}
