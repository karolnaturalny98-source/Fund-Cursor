import { Prisma } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ensureUserRecord } from "@/lib/services/user";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "@/lib/cache";

const USER_CASHBACK_POINTS_LIMIT = 5_000;

const createTransactionSchema = z.object({
  companySlug: z.string().min(1),
  transactionRef: z.string().min(3),
  points: z
    .number()
    .int()
    .positive()
    .max(USER_CASHBACK_POINTS_LIMIT, {
      message: `Przekroczono limit ${USER_CASHBACK_POINTS_LIMIT} punktów na pojedyncze zgłoszenie.`,
    }),
  notes: z.string().max(260).optional(),
});

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const userRecord = await ensureUserRecord({
    clerkId: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    displayName: user.fullName ?? null,
  });

  const json = await request.json().catch(() => null);
  const parsed = createTransactionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: data.companySlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "COMPANY_NOT_FOUND" },
        { status: 404 },
      );
    }

    const transaction = await prisma.cashbackTransaction.create({
      data: {
        companyId: company.id,
        userId: userRecord.id,
        transactionRef: data.transactionRef,
        points: data.points,
        // Użytkownik nie może ręcznie zatwierdzać transakcji – zawsze zaczynamy od PENDING,
        // a dalsza weryfikacja powinna zostać spięta z prawdziwym zdarzeniem zakupowym.
        status: "PENDING",
        notes: data.notes ?? null,
        purchasedAt: new Date(),
      },
    });

    try {
      revalidateTag(`cashback-${user.id}`);
    } catch (error) {
      console.warn("[cashback] Failed to revalidate tag", error);
    }

    return NextResponse.json({ data: transaction }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "TRANSACTION_EXISTS" },
        { status: 409 },
      );
    }

    console.error("Create cashback error:", error);
    return NextResponse.json(
      { error: "CREATE_TRANSACTION_FAILED" },
      { status: 500 },
    );
  }
}
