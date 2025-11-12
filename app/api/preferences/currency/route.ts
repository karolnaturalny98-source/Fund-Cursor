import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "@/lib/cache";

import {
  DEFAULT_CURRENCY,
  ensureSupportedCurrency,
  isSupportedCurrency,
} from "@/lib/currency";

const CURRENCY_COOKIE_NAME = "fundedrank_currency";
const HALF_YEAR_SECONDS = 60 * 60 * 24 * 30 * 6;

interface CurrencyPreferencePayload {
  currency?: string;
  source?: string;
}

export async function POST(request: Request) {
  let payload: CurrencyPreferencePayload;

  try {
    payload = (await request.json()) as CurrencyPreferencePayload;
  } catch {
    return NextResponse.json(
      { error: "Niepoprawny format danych" },
      { status: 400 },
    );
  }

  const candidate = payload.currency ?? DEFAULT_CURRENCY;

  if (!isSupportedCurrency(candidate)) {
    return NextResponse.json(
      { error: "Nieobslugiwany kod waluty" },
      { status: 422 },
    );
  }

  const normalized = ensureSupportedCurrency(candidate, DEFAULT_CURRENCY);
  const { userId } = await auth();

  try {
    revalidateTag(`currency-pref-${userId ?? "anon"}`);
  } catch (error) {
    console.warn("[currency] Failed to revalidate currency preference tag", error);
  }

  const response = NextResponse.json({ ok: true, currency: normalized });

  response.cookies.set({
    name: CURRENCY_COOKIE_NAME,
    value: normalized,
    path: "/",
    maxAge: HALF_YEAR_SECONDS,
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export async function PATCH(request: Request) {
  return POST(request);
}
