import { NextResponse } from "next/server";
import { revalidateTag } from "@/lib/cache";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const urlField = z.string().url().or(z.literal(""));

const createTeamMemberSchema = z.object({
  name: z.string().min(2).max(120),
  role: z.string().max(100),
  linkedInUrl: urlField.nullish(),
  profileImageUrl: urlField.nullish(),
  level: z.number().int().min(0).max(10),
  position: z.enum(["left", "right", "center"]).nullish(),
  order: z.number().int().min(0),
});

interface TeamRouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: TeamRouteParams) {
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

  const teamMembers = await prisma.teamMember.findMany({
    where: { companyId: company.id },
    orderBy: [
      { level: "asc" },
      { order: "asc" },
    ],
  });

  return NextResponse.json({ data: teamMembers });
}

export async function POST(request: Request, { params }: TeamRouteParams) {
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
  const parsed = createTeamMemberSchema.safeParse(json);

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
    const teamMember = await prisma.teamMember.create({
      data: {
        companyId: company.id,
        name: data.name,
        role: data.role,
        linkedInUrl: data.linkedInUrl ?? null,
        profileImageUrl: data.profileImageUrl ?? null,
        level: data.level,
        position: data.position ?? null,
        order: data.order,
      },
    });

    revalidateTag("companies");

    return NextResponse.json({ data: teamMember }, { status: 201 });
  } catch (error) {
    console.error("Create team member error:", error);
    return NextResponse.json(
      { error: "Nie udało się dodać członka zespołu." },
      { status: 500 },
    );
  }
}

