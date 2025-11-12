import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidateTag } from "@/lib/cache";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const urlField = z.string().url().or(z.literal(""));

const updateTeamMemberSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  role: z.string().max(100).optional(),
  linkedInUrl: urlField.nullish(),
  profileImageUrl: urlField.nullish(),
  level: z.number().int().min(0).max(10).optional(),
  position: z.enum(["left", "right", "center"]).nullish(),
  order: z.number().int().min(0).optional(),
});

interface TeamMemberRouteParams {
  params: Promise<{ slug: string; memberId: string }>;
}

export async function PATCH(request: Request, { params }: TeamMemberRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug, memberId } = await params;

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

  const member = await prisma.teamMember.findFirst({
    where: {
      id: memberId,
      companyId: company.id,
    },
  });

  if (!member) {
    return NextResponse.json(
      { error: "Nie znaleziono członka zespołu." },
      { status: 404 },
    );
  }

  const json = await request.json();
  const parsed = updateTeamMemberSchema.safeParse(json);

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

  const updateData: Prisma.TeamMemberUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.linkedInUrl !== undefined) updateData.linkedInUrl = data.linkedInUrl ?? null;
  if (data.profileImageUrl !== undefined) updateData.profileImageUrl = data.profileImageUrl ?? null;
  if (data.level !== undefined) updateData.level = data.level;
  if (data.position !== undefined) updateData.position = data.position ?? null;
  if (data.order !== undefined) updateData.order = data.order;

  try {
    const updated = await prisma.teamMember.update({
      where: { id: memberId },
      data: updateData,
    });

    revalidateTag("companies");

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Nie znaleziono członka zespołu." },
        { status: 404 },
      );
    }

    console.error("Update team member error:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować członka zespołu." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: TeamMemberRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug, memberId } = await params;

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

  const member = await prisma.teamMember.findFirst({
    where: {
      id: memberId,
      companyId: company.id,
    },
  });

  if (!member) {
    return NextResponse.json(
      { error: "Nie znaleziono członka zespołu." },
      { status: 404 },
    );
  }

  try {
    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    revalidateTag("companies");

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    console.error("Delete team member error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć członka zespołu." },
      { status: 500 },
    );
  }
}

