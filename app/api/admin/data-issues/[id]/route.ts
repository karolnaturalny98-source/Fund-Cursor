import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { revalidateTag } from "@/lib/cache";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  status: z.enum(["PENDING", "RESOLVED", "DISMISSED"]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await assertAdminRequest();

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Brak identyfikatora zgloszenia." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Niepoprawne dane." }, { status: 422 });
  }

  const { status, metadata } = parsed.data;

  await prisma.dataIssueReport.update({
    where: { id },
    data: {
      status,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
    },
  });

  try {
    revalidateTag("admin-data-issues");
    revalidatePath("/admin");
  } catch (error) {
    console.warn("[data-issues] Failed to revalidate admin cache", error);
  }

  return NextResponse.json({ status });
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
    return NextResponse.json({ error: "Brak identyfikatora zgłoszenia." }, { status: 400 });
  }

  try {
    await prisma.dataIssueReport.delete({
      where: { id },
    });

    try {
      revalidateTag("admin-data-issues");
      revalidatePath("/admin");
    } catch (revalidateError) {
      console.warn("[data-issues] Failed to revalidate admin cache", revalidateError);
    }

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Nie znaleziono zgłoszenia." },
        { status: 404 },
      );
    }

    console.error("Delete data issue error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć zgłoszenia." },
      { status: 500 },
    );
  }
}
