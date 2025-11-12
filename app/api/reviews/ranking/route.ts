import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getReviewsRanking } from "@/lib/queries/reviews";

const querySchema = z.object({
  search: z
    .string()
    .trim()
    .min(1)
    .optional(),
  minReviews: z
    .string()
    .transform((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : undefined;
    })
    .optional(),
  onlyRecent: z
    .string()
    .transform((value) => value === "true")
    .optional(),
  sortBy: z.enum(["rating", "reviews", "trend", "favorites"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid query parameters",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { search, minReviews, onlyRecent, sortBy, sortDirection } = parsed.data;

  const result = await getReviewsRanking({
    search: search ?? undefined,
    minReviews,
    onlyRecent: onlyRecent ?? false,
    sortBy: sortBy ?? "rating",
    sortDirection: sortDirection ?? "desc",
  });

  return NextResponse.json(result);
}
