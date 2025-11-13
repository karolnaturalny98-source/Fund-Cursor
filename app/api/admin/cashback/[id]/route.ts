import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { revalidateTag } from "@/lib/cache";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REDEEMED", "REJECTED"]).optional(),
  points: z.number().int().min(0).optional(),
  notes: z.string().max(260).optional(),
});

interface CashbackRouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: CashbackRouteProps) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);

  const parsed = updateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Błąd walidacji.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  if (
    payload.status === undefined &&
    payload.points === undefined &&
    payload.notes === undefined
  ) {
    return NextResponse.json(
      { error: "Brak danych do aktualizacji." },
      { status: 400 },
    );
  }

  const updateData: Prisma.CashbackTransactionUpdateInput = {};

  if (payload.points !== undefined) {
    updateData.points = payload.points;
  }

  if (payload.notes !== undefined) {
    updateData.notes = payload.notes ?? null;
  }

  if (payload.status) {
    updateData.status = payload.status;

    if (payload.status === "APPROVED") {
      updateData.approvedAt = new Date();
    }

    if (payload.status === "REDEEMED") {
      updateData.fulfilledAt = new Date();
    }
  }

  try {
    const transactionBeforeUpdate = await prisma.cashbackTransaction.findUnique({
      where: { id },
      select: {
        user: {
          select: {
            clerkId: true,
          },
        },
      },
    });

    const transaction = await prisma.cashbackTransaction.update({
      where: { id },
      data: updateData,
    });

    try {
      revalidatePath("/admin");
      const clerkId = transactionBeforeUpdate?.user?.clerkId;
      if (clerkId) {
        revalidateTag(`cashback-${String(clerkId)}`);
      }
    } catch (revalidateError) {
      console.warn("[admin/cashback] revalidate failed", revalidateError);
    }

    return NextResponse.json({ data: transaction });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Nie znaleziono transakcji cashback." },
        { status: 404 },
      );
    }

    console.error("Update cashback error:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować transakcji." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: CashbackRouteProps) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { id } = await params;

  try {
    // Check if transaction can be deleted (only PENDING or REJECTED)
    const transaction = await prisma.cashbackTransaction.findUnique({
      where: { id },
      select: { 
        status: true, 
        user: { select: { clerkId: true } },
        affiliateTransaction: { select: { id: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Nie znaleziono transakcji cashback." },
        { status: 404 },
      );
    }

    if (transaction.status === "APPROVED" || transaction.status === "REDEEMED") {
      return NextResponse.json(
        { 
          error: "Nie można usunąć zatwierdzonej lub zrealizowanej transakcji. Zmień status na PENDING lub REJECTED przed usunięciem." 
        },
        { status: 409 },
      );
    }

    // If there's a linked affiliate transaction, we should unlink it first
    if (transaction.affiliateTransaction) {
      await prisma.affiliateTransaction.update({
        where: { id: transaction.affiliateTransaction.id },
        data: { cashbackTransactionId: null },
      });
    }

    await prisma.cashbackTransaction.delete({
      where: { id },
    });

    try {
      revalidatePath("/admin");
      const clerkId = transaction.user?.clerkId;
      if (clerkId) {
        revalidateTag(`cashback-${String(clerkId)}`);
      }
    } catch (revalidateError) {
      console.warn("[admin/cashback] revalidate failed", revalidateError);
    }

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Nie znaleziono transakcji cashback." },
        { status: 404 },
      );
    }

    console.error("Delete cashback transaction error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć transakcji cashback." },
      { status: 500 },
    );
  }
}
