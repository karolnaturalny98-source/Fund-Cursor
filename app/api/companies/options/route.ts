import { NextResponse } from "next/server";

import { getCompanyOptions } from "@/lib/queries/companies";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export async function GET() {
  const companies = await getCompanyOptions();
  return NextResponse.json({ data: companies });
}
