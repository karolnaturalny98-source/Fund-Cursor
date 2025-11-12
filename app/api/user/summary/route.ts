import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getUserSummary } from "@/lib/queries/companies";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await getUserSummary(user.id);

  return NextResponse.json(summary);
}
