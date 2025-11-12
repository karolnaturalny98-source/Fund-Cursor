import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/lib/auth";
import {
  getAllReviewsHistory,
  ReviewHistoryParams,
  ReviewStatus,
} from "@/lib/queries/reviews";

export async function GET(req: Request) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const params: ReviewHistoryParams = {
    status: (searchParams.get("status") as ReviewStatus | "ALL") ?? "ALL",
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate") as string)
      : undefined,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate") as string)
      : undefined,
    companyId: searchParams.get("companyId") ?? undefined,
    minRating: searchParams.get("minRating")
      ? parseInt(searchParams.get("minRating") as string)
      : undefined,
    maxRating: searchParams.get("maxRating")
      ? parseInt(searchParams.get("maxRating") as string)
      : undefined,
    searchQuery: searchParams.get("searchQuery") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    take: searchParams.get("take")
      ? parseInt(searchParams.get("take") as string)
      : undefined,
  };

  try {
    const history = await getAllReviewsHistory(params);
    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching review history:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
