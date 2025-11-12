import { NextRequest, NextResponse } from "next/server";
import { getAllTransactionsHistory } from "@/lib/queries/transactions";
import type { TransactionHistoryParams, TransactionStatus } from "@/lib/queries/transactions";
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

    const params: TransactionHistoryParams = {
      type: (searchParams.get("type") as "all" | "redeem" | "manual") || "all",
      status: (searchParams.get("status") as TransactionStatus | "ALL" | null) || undefined,
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
      companyId: searchParams.get("companyId") || undefined,
      userId: searchParams.get("userId") || undefined,
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

    const result = await getAllTransactionsHistory(params);

    return NextResponse.json({
      transactions: result.transactions.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        approvedAt: t.approvedAt?.toISOString() ?? null,
        fulfilledAt: t.fulfilledAt?.toISOString() ?? null,
      })),
      nextCursor: result.nextCursor,
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction history" },
      { status: 500 },
    );
  }
}
