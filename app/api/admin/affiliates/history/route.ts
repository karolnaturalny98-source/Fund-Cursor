import { NextRequest, NextResponse } from "next/server";
import { getAllAffiliateTransactionsHistory } from "@/lib/queries/affiliates";
import type { AffiliateHistoryParams, AffiliateStatus } from "@/lib/queries/affiliates";
import { assertAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export async function GET(request: NextRequest) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;

    const params: AffiliateHistoryParams = {
      status: (searchParams.get("status") as AffiliateStatus | "ALL" | null) || undefined,
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
      companyId: searchParams.get("companyId") || undefined,
      platform: searchParams.get("platform") || undefined,
      searchQuery: searchParams.get("searchQuery") || undefined,
      minPoints: searchParams.get("minPoints")
        ? parseInt(searchParams.get("minPoints")!, 10)
        : undefined,
      maxPoints: searchParams.get("maxPoints")
        ? parseInt(searchParams.get("maxPoints")!, 10)
        : undefined,
      cursor: searchParams.get("cursor") || undefined,
      take: searchParams.get("take")
        ? parseInt(searchParams.get("take")!, 10)
        : 20,
    };

    const result = await getAllAffiliateTransactionsHistory(params);

    return NextResponse.json({
      transactions: result.transactions.map((t) => ({
        ...t,
        purchaseAt: t.purchaseAt?.toISOString() ?? null,
        verifiedAt: t.verifiedAt?.toISOString() ?? null,
        createdAt: t.createdAt.toISOString(),
      })),
      nextCursor: result.nextCursor,
    });
  } catch (error) {
    console.error("Error fetching affiliate history:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate history" },
      { status: 500 },
    );
  }
}
