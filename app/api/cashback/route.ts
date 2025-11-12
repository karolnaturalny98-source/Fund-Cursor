import { Prisma } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ensureUserRecord } from "@/lib/services/user";
import { prisma } from "@/lib/prisma";

const createTransactionSchema = z.object({
  companySlug: z.string().min(1),
  transactionRef: z.string().min(3),
  points: z.number().int().positive(),
  status: z
    .enum(["PENDING", "APPROVED", "REDEEMED", "REJECTED"])
    .default("PENDING"),
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
        status: data.status,
        notes: data.notes ?? null,
        purchasedAt: new Date(),
      },
    });

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
