import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/lib/auth";
import {
  getAllInfluencersHistory,
  InfluencerHistoryParams,
  InfluencerStatus,
} from "@/lib/queries/influencers";

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
  const params: InfluencerHistoryParams = {
    status: (searchParams.get("status") as InfluencerStatus | "ALL") ?? "ALL",
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate") as string)
      : undefined,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate") as string)
      : undefined,
    searchQuery: searchParams.get("searchQuery") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    take: searchParams.get("take")
      ? parseInt(searchParams.get("take") as string)
      : undefined,
  };

  try {
    const history = await getAllInfluencersHistory(params);
    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching influencer history:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
