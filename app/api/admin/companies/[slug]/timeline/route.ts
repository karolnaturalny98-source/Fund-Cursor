import { revalidateTag } from "@/lib/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createTimelineItemSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).nullish(),
  date: z.string().datetime(),
  type: z.enum(["milestone", "achievement", "update", "award"]).nullish(),
  icon: z.string().max(50).nullish(),
  order: z.number().int().min(0).default(0),
});

interface TimelineRouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: TimelineRouteParams) {
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

  const timelineItems = await prisma.companyTimeline.findMany({
    where: { companyId: company.id },
    orderBy: [
      { date: "desc" },
      { order: "asc" },
    ],
  });

  return NextResponse.json({ data: timelineItems });
}

export async function POST(request: Request, { params }: TimelineRouteParams) {
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
  const parsed = createTimelineItemSchema.safeParse(json);

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
    const timelineItem = await prisma.companyTimeline.create({
      data: {
        companyId: company.id,
        title: data.title,
        description: data.description ?? null,
        date: new Date(data.date),
        type: data.type ?? null,
        icon: data.icon ?? null,
        order: data.order,
      },
    });

    revalidateTag("companies");

    return NextResponse.json({ data: timelineItem }, { status: 201 });
  } catch (error) {
    console.error("Create timeline item error:", error);
    return NextResponse.json(
      { error: "Nie udało się dodać wydarzenia do timeline." },
      { status: 500 },
    );
  }
}

