import { NextResponse } from "next/server";

import { getCompanies } from "@/lib/queries/companies";

export async function GET() {
  try {
  const companies = await getCompanies();
  return NextResponse.json({ data: companies });
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 },
    );
  }
}
