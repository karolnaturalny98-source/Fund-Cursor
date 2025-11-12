import { Prisma } from "@prisma/client";
import type { ReviewStatus } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set<ReviewStatus>(["PENDING", "APPROVED", "REJECTED"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing review id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const status = body?.status as string | undefined;

  const normalizedStatus = status?.toUpperCase() as ReviewStatus | undefined;

  if (!normalizedStatus || !ALLOWED_STATUSES.has(normalizedStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await assertAdminRequest();

  const nextStatus = normalizedStatus;

  const data: Prisma.ReviewUpdateInput = {
    status: nextStatus,
  };

  if (nextStatus === "APPROVED") {
    data.publishedAt = new Date();
  } else if (nextStatus === "PENDING") {
    data.publishedAt = null;
  } else if (nextStatus === "REJECTED") {
    data.publishedAt = null;
  }

  await prisma.review.update({
    where: { id },
    data,
  });

  try {
    revalidatePath("/admin");
  } catch (revalidateError) {
    console.warn("[admin/reviews] revalidate failed", revalidateError);
  }

  return NextResponse.json({ status: nextStatus });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  if (!id) {
    return NextResponse.json({ error: "Brak identyfikatora recenzji." }, { status: 400 });
  }

  try {
    await prisma.review.delete({
      where: { id },
    });

    try {
      revalidatePath("/admin");
    } catch (revalidateError) {
      console.warn("[admin/reviews] revalidate failed", revalidateError);
    }

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Nie znaleziono recenzji." },
        { status: 404 },
      );
    }

    console.error("Delete review error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć recenzji." },
      { status: 500 },
    );
  }
}
