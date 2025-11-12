import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/lib/auth";
import {
  getAllDataIssuesHistory,
  DataIssueHistoryParams,
  DataIssueStatusType,
} from "@/lib/queries/data-issues";

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
  const params: DataIssueHistoryParams = {
    status:
      (searchParams.get("status") as DataIssueStatusType | "ALL") ?? "ALL",
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate") as string)
      : undefined,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate") as string)
      : undefined,
    companyId: searchParams.get("companyId") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    searchQuery: searchParams.get("searchQuery") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    take: searchParams.get("take")
      ? parseInt(searchParams.get("take") as string)
      : undefined,
  };

  try {
    const history = await getAllDataIssuesHistory(params);
    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching data issue history:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
