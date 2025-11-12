import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const urlField = z.string().url().or(z.literal(""));

const createMediaSchema = z.object({
  title: z.string().min(2).max(200),
  source: z.string().max(200).nullish(),
  url: z.string().url(),
  publishedAt: z.string().datetime(),
  description: z.string().max(1000).nullish(),
  imageUrl: urlField.nullish(),
  type: z.enum(["article", "interview", "press-release", "review"]).nullish(),
});

interface MediaRouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: MediaRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug } = await params;

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

  const mediaItems = await prisma.companyMedia.findMany({
    where: { companyId: company.id },
    orderBy: {
      publishedAt: "desc",
    },
  });

  return NextResponse.json({ data: mediaItems });
}

export async function POST(request: Request, { params }: MediaRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug } = await params;

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

  const json = await request.json();
  const parsed = createMediaSchema.safeParse(json);

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
    const mediaItem = await prisma.companyMedia.create({
      data: {
        companyId: company.id,
        title: data.title,
        source: data.source ?? null,
        url: data.url,
        publishedAt: new Date(data.publishedAt),
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        type: data.type ?? null,
      },
    });

    revalidateTag("companies");

    return NextResponse.json({ data: mediaItem }, { status: 201 });
  } catch (error) {
    console.error("Create media item error:", error);
    return NextResponse.json(
      { error: "Nie udało się dodać wpisu medialnego." },
      { status: 500 },
    );
  }
}

