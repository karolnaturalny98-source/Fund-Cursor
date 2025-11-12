import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import {
  approveAffiliateTransaction,
  rejectAffiliateTransaction,
} from "@/lib/queries/affiliates";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  points: z.number().int().positive().optional(),
  notes: z.string().max(260).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnien." : "Wymagane logowanie." },
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

  try {
    if (payload.action === "APPROVE") {
      const record = await approveAffiliateTransaction(id, {
        points: payload.points,
        notes: payload.notes,
      });

      try {
        revalidatePath("/admin");
      } catch (revalidateError) {
        console.warn("[admin/affiliates] revalidate failed", revalidateError);
      }

      return NextResponse.json({ data: record });
    }

    const record = await rejectAffiliateTransaction(id, payload.notes);
    return NextResponse.json({ data: record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    switch (message) {
      case "AFFILIATE_NOT_FOUND":
        return NextResponse.json(
          { error: "Nie znaleziono transakcji afiliacyjnej." },
          { status: 404 },
        );
      case "INVALID_POINTS":
        return NextResponse.json(
          { error: "Podaj dodatnią liczbę punktów." },
          { status: 422 },
        );
      case "USER_NOT_FOUND_FOR_AFFILIATE":
        return NextResponse.json(
          {
            error:
              "Nie znaleziono użytkownika powiązanego z transakcją. Uzupełnij email lub powiąż konto przed zatwierdzeniem.",
          },
          { status: 409 },
        );
      default:
        console.error("Affiliate update error:", error);
        return NextResponse.json(
          { error: "Nie udało się zaktualizować transakcji afiliacyjnej." },
          { status: 500 },
        );
    }
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
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
    // Check if affiliate transaction can be deleted (only PENDING or REJECTED)
    const transaction = await prisma.affiliateTransaction.findUnique({
      where: { id },
      select: { 
        status: true,
        cashbackTransaction: { select: { id: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Nie znaleziono transakcji afiliacyjnej." },
        { status: 404 },
      );
    }

    if (transaction.status === "APPROVED") {
      return NextResponse.json(
        { 
          error: "Nie można usunąć zatwierdzonej transakcji afiliacyjnej. Zmień status na PENDING lub REJECTED przed usunięciem." 
        },
        { status: 409 },
      );
    }

    // If there's a linked cashback transaction, delete it first
    if (transaction.cashbackTransaction) {
      await prisma.cashbackTransaction.delete({
        where: { id: transaction.cashbackTransaction.id },
      });
    }

    await prisma.affiliateTransaction.delete({
      where: { id },
    });

    try {
      revalidatePath("/admin");
    } catch (revalidateError) {
      console.warn("[admin/affiliates] revalidate failed", revalidateError);
    }

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Nie znaleziono transakcji afiliacyjnej." },
        { status: 404 },
      );
    }

    console.error("Delete affiliate transaction error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć transakcji afiliacyjnej." },
      { status: 500 },
    );
  }
}
