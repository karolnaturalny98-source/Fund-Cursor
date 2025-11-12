import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { assertAdminRequest } from "@/lib/auth";
import { getAdminDisputes } from "@/lib/queries/disputes";
import type { DisputeStatus } from "@/lib/types";

const statusValues = [
  "OPEN",
  "IN_REVIEW",
  "WAITING_USER",
  "RESOLVED",
  "REJECTED",
] as const;

type StatusLiteral = (typeof statusValues)[number];

function parseStatus(value: string | null): DisputeStatus | null {
  if (!value) {
    return null;
  }

  return statusValues.includes(value as StatusLiteral)
    ? (value as DisputeStatus)
    : null;
}

function parseLimit(value: string | null, fallback: number, max: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1), max);
}

export async function GET(request: NextRequest) {
  await assertAdminRequest();

  const { searchParams } = new URL(request.url);
  const limit = parseLimit(searchParams.get("limit"), 25, 100);
  const cursor = searchParams.get("cursor");
  const status = parseStatus(searchParams.get("status"));
  const query = searchParams.get("q");

  const result = await getAdminDisputes({
    limit,
    cursor,
    status,
    query,
  });

  return NextResponse.json(result);
}
