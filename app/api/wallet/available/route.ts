import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getUserAvailablePoints } from "@/lib/queries/transactions";

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const available = await getUserAvailablePoints(user.id);

  return NextResponse.json({ available });
}
