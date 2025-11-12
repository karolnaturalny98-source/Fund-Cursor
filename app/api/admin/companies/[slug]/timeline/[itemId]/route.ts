import { revalidateTag } from "@/lib/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateTimelineItemSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).nullish(),
  date: z.string().datetime().optional(),
  type: z.enum(["milestone", "achievement", "update", "award"]).nullish(),
  icon: z.string().max(50).nullish(),
  order: z.number().int().min(0).optional(),
});

interface TimelineItemRouteParams {
  params: Promise<{ slug: string; itemId: string }>;
}

export async function PATCH(request: Request, { params }: TimelineItemRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug, itemId } = await params;

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
  const parsed = updateTimelineItemSchema.safeParse(json);

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

  const timelineItem = await prisma.companyTimeline.findFirst({
    where: {
      id: itemId,
      companyId: company.id,
    },
    select: {
      id: true,
    },
  });

  if (!timelineItem) {
    return NextResponse.json(
      { error: "Nie znaleziono wydarzenia." },
      { status: 404 },
    );
  }

  try {
    const updateData: {
      title?: string;
      description?: string | null;
      date?: Date;
      type?: string | null;
      icon?: string | null;
      order?: number;
    } = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.type !== undefined) updateData.type = data.type ?? null;
    if (data.icon !== undefined) updateData.icon = data.icon ?? null;
    if (data.order !== undefined) updateData.order = data.order;

    const updatedItem = await prisma.companyTimeline.update({
      where: { id: itemId },
      data: updateData,
    });

    revalidateTag("companies");

    return NextResponse.json({ data: updatedItem });
  } catch (error) {
    console.error("Update timeline item error:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować wydarzenia." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: TimelineItemRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug, itemId } = await params;

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

  const timelineItem = await prisma.companyTimeline.findFirst({
    where: {
      id: itemId,
      companyId: company.id,
    },
    select: {
      id: true,
    },
  });

  if (!timelineItem) {
    return NextResponse.json(
      { error: "Nie znaleziono wydarzenia." },
      { status: 404 },
    );
  }

  try {
    await prisma.companyTimeline.delete({
      where: { id: itemId },
    });

    revalidateTag("companies");

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    console.error("Delete timeline item error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć wydarzenia." },
      { status: 500 },
    );
  }
}

