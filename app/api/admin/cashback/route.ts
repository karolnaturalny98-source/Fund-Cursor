import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { revalidateTag } from "@/lib/cache";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureUserRecord } from "@/lib/services/user";

const createSchema = z
  .object({
    companySlug: z.string().min(1),
    points: z.number().int().positive(),
    status: z.enum(["PENDING", "APPROVED", "REDEEMED"]).default("APPROVED"),
    notes: z.string().max(260).optional(),
    clerkId: z.string().min(1).optional(),
    email: z.string().email().optional(),
  })
  .refine(
    (data) => Boolean(data.clerkId || data.email),
    "Podaj Clerk ID lub email użytkownika.",
  );

export async function POST(request: Request) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      {
        error:
          message === "FORBIDDEN"
            ? "Brak uprawnień do wykonania operacji."
            : "Wymagane logowanie administratora.",
      },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Błąd walidacji.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const company = await prisma.company.findUnique({
    where: { slug: data.companySlug },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Nie znaleziono firmy o podanym slugu." },
      { status: 404 },
    );
  }

  const clerkId = data.clerkId ?? null;
  const email = data.email ?? null;

  let userRecord:
    | { id: string; clerkId: string | null }
    | null = null;

  if (clerkId) {
    const ensured = await ensureUserRecord({
      clerkId,
      email,
      displayName: undefined,
    });
    userRecord = { id: ensured.id, clerkId: ensured.clerkId };
  } else if (email) {
    userRecord = await prisma.user.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        clerkId: true,
      },
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: "Nie znaleziono użytkownika o podanym adresie e-mail." },
        { status: 404 },
      );
    }
  }

  if (!userRecord) {
    return NextResponse.json(
      { error: "Nie udało się odnaleźć użytkownika." },
      { status: 404 },
    );
  }

  const now = new Date();

  const transaction = await prisma.cashbackTransaction.create({
    data: {
      companyId: company.id,
      userId: userRecord.id,
      transactionRef: `admin_manual_${randomUUID()}`,
      points: data.points,
      status: data.status,
      notes: data.notes ?? null,
      approvedAt:
        data.status === "APPROVED" || data.status === "REDEEMED" ? now : null,
      fulfilledAt: data.status === "REDEEMED" ? now : null,
    },
  });

  try {
    revalidatePath("/admin");
    if (userRecord.clerkId) {
      revalidateTag(`cashback-${String(userRecord.clerkId)}`);
    }
  } catch (error) {
    console.warn("[admin-cashback] Failed to revalidate cache", error);
  }

  return NextResponse.json({ data: transaction }, { status: 201 });
}
