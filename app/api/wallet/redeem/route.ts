import { randomUUID } from "node:crypto";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { revalidateTag } from "@/lib/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getUserAvailablePoints } from "@/lib/queries/transactions";
import { ensureUserRecord } from "@/lib/services/user";

const redeemSchema = z
  .object({
    points: z.number().int().positive(),
    companyId: z.string().min(1).optional(),
    companySlug: z.string().min(1).optional(),
    planLabel: z.string().min(1).max(120).optional(),
    notes: z.string().max(260).optional(),
  })
  .refine(
    (data) => data.companyId || data.companySlug,
    "Wybierz firmę, dla której chcesz odebrać konto.",
  );

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = redeemSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  const available = await getUserAvailablePoints(user.id);

  if (payload.points > available) {
    return NextResponse.json(
      { error: "INSUFFICIENT_POINTS", available },
      { status: 422 },
    );
  }

  const company = await prisma.company.findFirst({
    where: payload.companyId
      ? { id: payload.companyId }
      : { slug: payload.companySlug },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!company) {
    return NextResponse.json(
      { error: "COMPANY_NOT_FOUND" },
      { status: 404 },
    );
  }

  const userRecord = await ensureUserRecord({
    clerkId: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    displayName: user.fullName ?? null,
  });

  const noteParts = [
    payload.planLabel ? `Plan: ${payload.planLabel}` : null,
    payload.notes ? payload.notes : null,
  ].filter(Boolean) as string[];

  const combinedNote = noteParts.join(" | ");
  const sanitizedNote =
    combinedNote.length > 0
      ? combinedNote.slice(0, 260)
      : null;

  const transaction = await prisma.cashbackTransaction.create({
    data: {
      companyId: company.id,
      userId: userRecord.id,
      transactionRef: `redeem_${randomUUID()}`,
      points: -payload.points,
      status: "PENDING",
      notes: sanitizedNote,
    },
  });

  try {
    revalidateTag(`cashback-${user.id}`);
    revalidatePath("/admin");
  } catch (error) {
    console.warn("[wallet/redeem] Revalidation failed", error);
  }

  const refreshedAvailable = await getUserAvailablePoints(user.id);

  return NextResponse.json({
    status: "submitted" as const,
    transaction: {
      id: transaction.id,
      status: transaction.status,
      points: transaction.points,
      createdAt: transaction.createdAt,
      companySlug: company.slug,
    },
    available: refreshedAvailable,
  });
}
