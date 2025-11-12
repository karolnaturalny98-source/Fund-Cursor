import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  MARKETING_DEFAULT_SECTION_SLUG,
  getSpotlightsForSection,
  transformSpotlight,
} from "@/lib/queries/marketing";

const createSpotlightSchema = z.object({
  sectionId: z.string().min(1).optional(),
  sectionSlug: z.string().min(1).optional(),
  title: z.string().min(3).max(80),
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
});

function coerceDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request: Request) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "FORBIDDEN" : "UNAUTHENTICATED" },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const url = new URL(request.url);
  const sectionSlug = url.searchParams.get("section") || MARKETING_DEFAULT_SECTION_SLUG;

  const section = await getSpotlightsForSection(sectionSlug, {
    includeInactive: true,
  });

  return NextResponse.json({
    section,
    data: section?.spotlights ?? [],
  });
}

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
  const parsed = createSpotlightSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Błąd walidacji.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  const sectionIdentifier = payload.sectionId
    ? { id: payload.sectionId }
    : {
        slug: payload.sectionSlug || MARKETING_DEFAULT_SECTION_SLUG,
      };

  const section = await prisma.marketingSpotlightSection.findUnique({
    where: sectionIdentifier,
  });

  if (!section) {
    return NextResponse.json(
      { error: "Sekcja marketingowa nie została znaleziona." },
      { status: 404 },
    );
  }

  const now = new Date();

  const startsAt = coerceDate(payload.startsAt) ?? now;
  const endsAt = coerceDate(payload.endsAt);

  if (startsAt && endsAt && startsAt > endsAt) {
    return NextResponse.json(
      { error: "Data zakończenia nie może być wcześniejsza niż data startu." },
      { status: 400 },
    );
  }

  const currentMaxOrder = await prisma.marketingSpotlight.aggregate({
    where: { sectionId: section.id },
    _max: { order: true },
  });

  const order =
    payload.order ??
    (typeof currentMaxOrder._max.order === "number" ? currentMaxOrder._max.order + 1 : 0);

  try {
    const spotlight = await prisma.marketingSpotlight.create({
      data: {
        sectionId: section.id,
        companyId: payload.companyId ?? null,
        title: payload.title,
        headline: payload.headline ?? null,
        badgeLabel: payload.badgeLabel ?? null,
        badgeTone: payload.badgeTone ?? null,
        discountValue: payload.discountValue ?? null,
        rating: payload.rating !== null && payload.rating !== undefined ? new Prisma.Decimal(payload.rating) : null,
        ratingCount: payload.ratingCount ?? null,
        ctaLabel: payload.ctaLabel ?? null,
        ctaUrl: payload.ctaUrl ?? null,
        imageUrl: payload.imageUrl ?? null,
        isActive: payload.isActive ?? true,
        order,
        startsAt,
        endsAt,
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

    return NextResponse.json({ data: transformSpotlight(spotlight) }, { status: 201 });
  } catch (error) {
    console.error("[admin/marketing] create spotlight error", error);
    return NextResponse.json(
      { error: "Nie udało się utworzyć spotlightu marketingowego." },
      { status: 500 },
    );
  }
}


