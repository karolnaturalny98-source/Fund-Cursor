import { NextResponse } from "next/server";

import { getInfluencerProfiles } from "@/lib/queries/influencers";
import { assertAdminRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : 50;

  const profiles = await getInfluencerProfiles(Number.isFinite(limit) ? limit : 50);
  return NextResponse.json({ data: profiles });
}
