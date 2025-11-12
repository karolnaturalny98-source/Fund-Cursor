import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getInfluencerProfileById } from "@/lib/queries/influencers";
import { prisma } from "@/lib/prisma";
import { assertAdminRequest } from "@/lib/auth";

const updateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  referralCode: z
    .string()
    .trim()
    .max(60, "Kod może mieć maksymalnie 60 znaków.")
    .optional(),
  notes: z
    .string()
    .trim()
    .max(500, "Notatka może mieć maksymalnie 500 znaków.")
    .optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  const data: Record<string, unknown> = {};

  if (payload.status) {
    data.status = payload.status;
  }

  if (payload.referralCode !== undefined) {
    data.referralCode = payload.referralCode.length ? payload.referralCode : null;
  }

  if (payload.notes !== undefined) {
    data.notes = payload.notes.length ? payload.notes : null;
  }

  try {
    await prisma.influencerProfile.update({
      where: { id },
      data,
    });
    try {
      revalidatePath("/admin");
    } catch (revalidateError) {
      console.warn("[admin/influencers] revalidate failed", revalidateError);
    }
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "REFERRAL_CODE_CONFLICT" },
        { status: 409 },
      );
    }

    console.error("[admin/influencers] update error", error);
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }

  const profile = await getInfluencerProfileById(id);

  if (!profile) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ data: profile });
}

export async function DELETE(
  _request: Request,
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
    await prisma.influencerProfile.delete({
      where: { id },
    });

    try {
      revalidatePath("/admin");
    } catch (revalidateError) {
      console.warn("[admin/influencers] revalidate failed", revalidateError);
    }

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Nie znaleziono profilu influencera." },
        { status: 404 },
      );
    }

    console.error("Delete influencer profile error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć profilu influencera." },
      { status: 500 },
    );
  }
}
