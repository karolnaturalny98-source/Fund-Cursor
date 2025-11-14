import { NextResponse } from "next/server";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "@/lib/cache";

const ADMIN_POINTS_ABSOLUTE_LIMIT = 100_000;

const manualCashbackSchema = z
  .object({
    companyId: z.string().cuid().optional(),
    companySlug: z.string().min(1).optional(),
    userId: z.string().cuid().optional(),
    userClerkId: z.string().min(1).optional(),
    userEmail: z.string().email().optional(),
    transactionRef: z.string().min(3),
    points: z
      .number()
      .int()
      .refine((value) => Math.abs(value) <= ADMIN_POINTS_ABSOLUTE_LIMIT, {
        message: `Maksymalna liczba punktów (względna) to ${ADMIN_POINTS_ABSOLUTE_LIMIT}.`,
      }),
    status: z.enum(["PENDING", "APPROVED", "REDEEMED", "REJECTED"]).default("PENDING"),
    notes: z.string().max(260).optional(),
    purchasedAt: z.coerce.date().optional(),
  })
  .refine((data) => data.companyId || data.companySlug, {
    message: "Wymagane jest wskazanie firmy (ID lub slug).",
    path: ["companyId"],
  })
  .refine((data) => data.userId || data.userClerkId || data.userEmail, {
    message: "Wymagane jest wskazanie użytkownika (userId, clerkId lub email).",
    path: ["userId"],
  });

export async function POST(request: Request) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      {
        error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED",
      },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = manualCashbackSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const company = await prisma.company.findFirst({
    where: data.companyId
      ? { id: data.companyId }
      : { slug: data.companySlug ?? undefined },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!company) {
    return NextResponse.json({ error: "COMPANY_NOT_FOUND" }, { status: 404 });
  }

  const targetUser = await resolveTargetUser({
    id: data.userId,
    clerkId: data.userClerkId,
    email: data.userEmail,
  });

  if (!targetUser) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  try {
    const transaction = await prisma.cashbackTransaction.create({
      data: {
        companyId: company.id,
        userId: targetUser.id,
        transactionRef: data.transactionRef,
        points: data.points,
        status: data.status,
        notes: data.notes ?? null,
        purchasedAt: data.purchasedAt ?? new Date(),
      },
    });

    // Proste logowanie audytowe – docelowo warto to wysyłać do dedykowanego systemu.
    console.info(
      "[admin-cashback] Manual cashback created",
      JSON.stringify({
        transactionId: transaction.id,
        companyId: company.id,
        userId: targetUser.id,
        clerkId: targetUser.clerkId,
      }),
    );

    try {
      const tagUserKey = targetUser.clerkId ?? targetUser.id;
      revalidateTag(`cashback-${tagUserKey}`);
    } catch (error) {
      console.warn("[admin-cashback] Failed to revalidate tag", error);
    }

    return NextResponse.json({ data: transaction }, { status: 201 });
  } catch (error) {
    console.error("[admin-cashback] Failed to create transaction", error);
    return NextResponse.json(
      { error: "CREATE_TRANSACTION_FAILED" },
      { status: 500 },
    );
  }
}

async function resolveTargetUser({
  id,
  clerkId,
  email,
}: {
  id?: string;
  clerkId?: string;
  email?: string;
}) {
  if (id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, clerkId: true },
    });
    return user;
  }

  if (clerkId) {
    return prisma.user.findFirst({
      where: { clerkId },
      select: { id: true, clerkId: true },
    });
  }

  if (email) {
    return prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: { id: true, clerkId: true },
    });
  }

  return null;
}
