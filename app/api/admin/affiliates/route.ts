import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAffiliateQueue,
  importAffiliateTransaction,
  findUserIdByEmail,
} from "@/lib/queries/affiliates";

const importSchema = z.object({
  companySlug: z.string().min(1),
  externalId: z.string().min(1),
  userEmail: z.string().email().optional(),
  platform: z.string().max(120).optional(),
  amount: z.number().nonnegative().optional(),
  currency: z.string().min(1).max(6).optional(),
  points: z.number().int().positive(),
  purchaseAt: z.coerce.date().optional(),
  notes: z.string().max(260).optional(),
});

export async function GET() {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnien." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const queue = await getAffiliateQueue();

  return NextResponse.json({ data: queue });
}

export async function POST(request: Request) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnien." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = importSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Błąd walidacji.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  const company = await prisma.company.findUnique({
    where: { slug: payload.companySlug },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Nie znaleziono firmy o podanym slugu." },
      { status: 404 },
    );
  }

  const userId = await findUserIdByEmail(payload.userEmail);

  try {
    const record = await importAffiliateTransaction({
      companyId: company.id,
      userId,
      platform: payload.platform ?? null,
      externalId: payload.externalId,
      userEmail: payload.userEmail ?? null,
      amount:
        typeof payload.amount === "number"
          ? new Prisma.Decimal(payload.amount)
          : null,
      currency: payload.currency ?? "USD",
      points: payload.points,
      purchaseAt: payload.purchaseAt ?? null,
      notes: payload.notes ?? null,
    });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Transakcja o tym identyfikatorze została już zaimportowana." },
        { status: 409 },
      );
    }

    console.error("Affiliate import error:", error);
    return NextResponse.json(
      { error: "Nie udało się zaimportować transakcji afiliacyjnej." },
      { status: 500 },
    );
  }
}
