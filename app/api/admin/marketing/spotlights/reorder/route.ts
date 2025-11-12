import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MARKETING_DEFAULT_SECTION_SLUG } from "@/lib/queries/marketing";

const reorderSchema = z.object({
  sectionId: z.string().min(1).optional(),
  sectionSlug: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        order: z.number().int().min(0),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = reorderSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Błąd walidacji.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  const sectionIdentifier = payload.sectionId
    ? { id: payload.sectionId }
    : { slug: payload.sectionSlug || MARKETING_DEFAULT_SECTION_SLUG };

  const section = await prisma.marketingSpotlightSection.findUnique({
    where: sectionIdentifier,
    select: { id: true },
  });

  if (!section) {
    return NextResponse.json(
      { error: "Sekcja marketingowa nie została znaleziona." },
      { status: 404 },
    );
  }

  const existing = await prisma.marketingSpotlight.findMany({
    where: { sectionId: section.id },
    select: { id: true },
  });

  const validIds = new Set(existing.map((item) => item.id));

  const hasInvalid = payload.items.some((item) => !validIds.has(item.id));

  if (hasInvalid) {
    return NextResponse.json(
      { error: "Nieprawidłowe identyfikatory spotlightów dla tej sekcji." },
      { status: 400 },
    );
  }

  const updates = payload.items.map(({ id, order }) =>
    prisma.marketingSpotlight.update({
      where: { id },
      data: { order },
    }),
  );

  try {
    await prisma.$transaction(updates);

    try {
      revalidatePath("/");
      revalidatePath("/admin/marketing");
    } catch (revalidateError) {
      console.warn("[admin/marketing] revalidate failed", revalidateError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/marketing] reorder error", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować kolejności." },
      { status: 500 },
    );
  }
}


