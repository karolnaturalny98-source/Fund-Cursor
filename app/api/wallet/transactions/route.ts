import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  getUserTransactionsPage,
  type TransactionStatus,
} from "@/lib/queries/transactions";

const ALLOWED_STATUSES = new Set<TransactionStatus>([
  "PENDING",
  "APPROVED",
  "REDEEMED",
  "REJECTED",
]);

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const statusParam = searchParams.get("status");
  const normalizedStatus = statusParam
    ? (statusParam.toUpperCase() as TransactionStatus)
    : undefined;
  const status =
    normalizedStatus && ALLOWED_STATUSES.has(normalizedStatus)
      ? normalizedStatus
      : undefined;

  if (statusParam && !status) {
    return NextResponse.json(
      { error: "INVALID_STATUS" },
      { status: 400 },
    );
  }

  const cursor = searchParams.get("cursor") ?? undefined;
  const takeParam = searchParams.get("take");
  let take: number | undefined;

  if (takeParam) {
    const parsed = Number.parseInt(takeParam, 10);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 50) {
      return NextResponse.json(
        { error: "INVALID_TAKE" },
        { status: 400 },
      );
    }
    take = parsed;
  }

  const redeemOnly = searchParams.get("redeemOnly") === "true";

  const page = await getUserTransactionsPage({
    userId: user.id,
    status,
    cursor,
    take,
    onlyRedeem: redeemOnly,
  });

  return NextResponse.json(page);
}
