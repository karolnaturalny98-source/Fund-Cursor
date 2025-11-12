import { revalidateTag } from "@/lib/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const urlField = z.string().url().or(z.literal(""));

const updateMediaSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  source: z.string().max(200).nullish(),
  url: z.string().url().optional(),
  publishedAt: z.string().datetime().optional(),
  description: z.string().max(1000).nullish(),
  imageUrl: urlField.nullish(),
  type: z.enum(["article", "interview", "press-release", "review"]).nullish(),
});

interface MediaItemRouteParams {
  params: Promise<{ slug: string; mediaId: string }>;
}

export async function PATCH(request: Request, { params }: MediaItemRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug, mediaId } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Nie znaleziono firmy o podanym slugu." },
      { status: 404 },
    );
  }

  const mediaItem = await prisma.companyMedia.findFirst({
    where: {
      id: mediaId,
      companyId: company.id,
    },
    select: {
      id: true,
    },
  });

  if (!mediaItem) {
    return NextResponse.json(
      { error: "Nie znaleziono wpisu medialnego." },
      { status: 404 },
    );
  }

  const json = await request.json();
  const parsed = updateMediaSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Błąd walidacji.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  try {
    const updateData: {
      title?: string;
      source?: string | null;
      url?: string;
      publishedAt?: Date;
      description?: string | null;
      imageUrl?: string | null;
      type?: string | null;
    } = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.source !== undefined) updateData.source = data.source ?? null;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.publishedAt !== undefined) updateData.publishedAt = new Date(data.publishedAt);
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl ?? null;
    if (data.type !== undefined) updateData.type = data.type ?? null;

    const mediaItem = await prisma.companyMedia.update({
      where: { id: mediaId },
      data: updateData,
    });

    revalidateTag("companies");

    return NextResponse.json({ data: mediaItem });
  } catch (error) {
    console.error("Update media item error:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować wpisu medialnego." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: MediaItemRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug, mediaId } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Nie znaleziono firmy o podanym slugu." },
      { status: 404 },
    );
  }

  const mediaItem = await prisma.companyMedia.findFirst({
    where: {
      id: mediaId,
      companyId: company.id,
    },
    select: {
      id: true,
    },
  });

  if (!mediaItem) {
    return NextResponse.json(
      { error: "Nie znaleziono wpisu medialnego." },
      { status: 404 },
    );
  }

  try {
    await prisma.companyMedia.delete({
      where: { id: mediaId },
    });

    revalidateTag("companies");

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    console.error("Delete media item error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć wpisu medialnego." },
      { status: 500 },
    );
  }
}

