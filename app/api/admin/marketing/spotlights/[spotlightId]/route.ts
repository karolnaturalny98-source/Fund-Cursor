import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transformSpotlight } from "@/lib/queries/marketing";

const updateSpotlightSchema = z
  .object({
    title: z.string().min(3).max(80).optional(),
    headline: z.string().max(160).nullish(),
    badgeLabel: z.string().max(32).nullish(),
    badgeTone: z.string().max(32).nullish(),
    discountValue: z.number().int().min(0).max(100).nullish(),
    rating: z.number().min(0).max(5).step(0.1).nullish(),
    ratingCount: z.number().int().min(0).nullish(),
    ctaLabel: z.string().max(60).nullish(),
    ctaUrl: z.string().url().max(200).nullish(),
    imageUrl: z.string().url().max(400).nullish(),
    companyId: z.string().min(1).nullish(),
    isActive: z.boolean().optional(),
    startsAt: z.string().datetime().nullish(),
    endsAt: z.string().datetime().nullish(),
    order: z.number().int().min(0).optional(),
    metadata: z.record(z.string(), z.unknown()).nullish(),
  })
  .refine(
    (data) => {
      if (!data.startsAt || !data.endsAt) {
        return true;
      }
      const startDate = new Date(data.startsAt);
      const endDate = new Date(data.endsAt);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return false;
      }
      return startDate <= endDate;
    },
    {
      message: "Data zakończenia nie może być wcześniejsza niż data startu.",
      path: ["endsAt"],
    },
  );

interface SpotlightRouteProps {
  params: Promise<{ spotlightId: string }>;
}

function coerceDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function PATCH(request: Request, { params }: SpotlightRouteProps) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { spotlightId } = await params;

  const json = await request.json().catch(() => null);
  const parsed = updateSpotlightSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Błąd walidacji.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  try {
    const spotlight = await prisma.marketingSpotlight.update({
      where: { id: spotlightId },
      data: {
        title: payload.title,
        headline: payload.headline === undefined ? undefined : payload.headline ?? null,
        badgeLabel: payload.badgeLabel === undefined ? undefined : payload.badgeLabel ?? null,
        badgeTone: payload.badgeTone === undefined ? undefined : payload.badgeTone ?? null,
        discountValue:
          payload.discountValue === undefined ? undefined : payload.discountValue ?? null,
        rating:
          payload.rating === undefined
            ? undefined
            : payload.rating === null
            ? null
            : new Prisma.Decimal(payload.rating),
        ratingCount:
          payload.ratingCount === undefined ? undefined : payload.ratingCount ?? null,
        ctaLabel: payload.ctaLabel === undefined ? undefined : payload.ctaLabel ?? null,
        ctaUrl: payload.ctaUrl === undefined ? undefined : payload.ctaUrl ?? null,
        imageUrl: payload.imageUrl === undefined ? undefined : payload.imageUrl ?? null,
        companyId: payload.companyId === undefined ? undefined : payload.companyId ?? null,
        isActive: payload.isActive,
        order: payload.order,
        startsAt:
          payload.startsAt === undefined ? undefined : coerceDate(payload.startsAt) ?? null,
        endsAt: payload.endsAt === undefined ? undefined : coerceDate(payload.endsAt) ?? null,
        metadata:
          payload.metadata === undefined
            ? undefined
            : payload.metadata === null
            ? Prisma.JsonNull
            : (payload.metadata as Prisma.InputJsonValue),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            rating: true,
          },
        },
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/admin/marketing");
    } catch (revalidateError) {
      console.warn("[admin/marketing] revalidate failed", revalidateError);
    }

    return NextResponse.json({ data: transformSpotlight(spotlight) });
  } catch (error) {
    console.error("[admin/marketing] update spotlight error", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować spotlightu marketingowego." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: SpotlightRouteProps) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { spotlightId } = await params;

  try {
    const spotlight = await prisma.marketingSpotlight.delete({
      where: { id: spotlightId },
      select: {
        id: true,
        sectionId: true,
        order: true,
      },
    });

    await prisma.$transaction(async (tx) => {
      const remaining = await tx.marketingSpotlight.findMany({
        where: {
          sectionId: spotlight.sectionId,
        },
        orderBy: { order: "asc" },
      });

      await Promise.all(
        remaining.map((item, index) =>
          tx.marketingSpotlight.update({
            where: { id: item.id },
            data: { order: index },
          }),
        ),
      );
    });

    try {
      revalidatePath("/");
      revalidatePath("/admin/marketing");
    } catch (revalidateError) {
      console.warn("[admin/marketing] revalidate failed", revalidateError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/marketing] delete spotlight error", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć spotlightu marketingowego." },
      { status: 500 },
    );
  }
}


