import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidateTag } from "@/lib/cache";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import {
  getDisputeById,
  updateDisputeCase,
} from "@/lib/queries/disputes";
import { prisma } from "@/lib/prisma";
import { ensureUserRecord } from "@/lib/services/user";
import { currentUser } from "@clerk/nextjs/server";

const statusValues = [
  "OPEN",
  "IN_REVIEW",
  "WAITING_USER",
  "RESOLVED",
  "REJECTED",
] as const;

const payloadSchema = z.object({
  status: z.enum(statusValues).optional(),
  resolutionNotes: z
    .string()
    .max(4000)
    .nullable()
    .optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  assignToSelf: z.boolean().optional(),
  assignedAdminId: z.string().cuid().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await assertAdminRequest();

  const { id } = await params;

  const dispute = await getDisputeById(id);

  if (!dispute) {
    return NextResponse.json({ error: "Nie znaleziono sprawy." }, { status: 404 });
  }

  return NextResponse.json(dispute);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await assertAdminRequest();

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Niepoprawne dane.", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;
  let assignedAdminId =
    data.assignedAdminId === undefined ? undefined : data.assignedAdminId;

  if (data.assignToSelf) {
    const adminUser = await currentUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ensured = await ensureUserRecord({
      clerkId: adminUser.id,
      email: adminUser.primaryEmailAddress?.emailAddress ?? null,
      displayName: adminUser.fullName ?? null,
    });

    assignedAdminId = ensured.id;
  }

  const updated = await updateDisputeCase(id, {
    status: data.status,
    resolutionNotes:
      data.resolutionNotes === undefined ? undefined : data.resolutionNotes,
    assignedAdminId,
    metadata:
      data.metadata === undefined ? undefined : data.metadata ?? null,
  });

  try {
    revalidateTag("admin-disputes");
    if (updated.user?.clerkId) {
      revalidateTag(`user-disputes-${updated.user.clerkId}`);
    }
  } catch (error) {
    console.warn("[disputes:admin] failed to revalidate cache", error);
  }

  return NextResponse.json(updated);
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

  try {
    // Check if dispute can be deleted (only RESOLVED or REJECTED)
    const dispute = await prisma.disputeCase.findUnique({
      where: { id },
      select: { status: true, user: { select: { clerkId: true } } },
    });

    if (!dispute) {
      return NextResponse.json(
        { error: "Nie znaleziono sporu." },
        { status: 404 },
      );
    }

    if (dispute.status !== "RESOLVED" && dispute.status !== "REJECTED") {
      return NextResponse.json(
        { 
          error: "Można usunąć tylko zamknięte spory (RESOLVED lub REJECTED). Zmień status sporu przed usunięciem." 
        },
        { status: 409 },
      );
    }

    await prisma.disputeCase.delete({
      where: { id },
    });

    try {
      revalidateTag("admin-disputes");
      if (dispute.user?.clerkId) {
        revalidateTag(`user-disputes-${dispute.user.clerkId}`);
      }
    } catch (revalidateError) {
      console.warn("[disputes:admin] failed to revalidate cache", revalidateError);
    }

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Nie znaleziono sporu." },
        { status: 404 },
      );
    }

    console.error("Delete dispute error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć sporu." },
      { status: 500 },
    );
  }
}
