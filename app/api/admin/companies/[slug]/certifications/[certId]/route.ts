import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const urlField = z.string().url().or(z.literal(""));

const updateCertificationSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  issuer: z.string().max(200).nullish(),
  description: z.string().max(1000).nullish(),
  url: urlField.nullish(),
  imageUrl: urlField.nullish(),
  issuedDate: z.string().datetime().nullish(),
  expiryDate: z.string().datetime().nullish(),
});

interface CertificationItemRouteParams {
  params: Promise<{ slug: string; certId: string }>;
}

export async function PATCH(request: Request, { params }: CertificationItemRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug, certId } = await params;

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

  const certification = await prisma.companyCertification.findFirst({
    where: {
      id: certId,
      companyId: company.id,
    },
    select: {
      id: true,
    },
  });

  if (!certification) {
    return NextResponse.json(
      { error: "Nie znaleziono certyfikatu." },
      { status: 404 },
    );
  }

  const json = await request.json();
  const parsed = updateCertificationSchema.safeParse(json);

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
      name?: string;
      issuer?: string | null;
      description?: string | null;
      url?: string | null;
      imageUrl?: string | null;
      issuedDate?: Date | null;
      expiryDate?: Date | null;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.issuer !== undefined) updateData.issuer = data.issuer ?? null;
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.url !== undefined) updateData.url = data.url ?? null;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl ?? null;
    if (data.issuedDate !== undefined) updateData.issuedDate = data.issuedDate ? new Date(data.issuedDate) : null;
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;

    const certification = await prisma.companyCertification.update({
      where: { id: certId },
      data: updateData,
    });

    revalidateTag("companies");

    return NextResponse.json({ data: certification });
  } catch (error) {
    console.error("Update certification error:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować certyfikatu." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: CertificationItemRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug, certId } = await params;

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

  const certification = await prisma.companyCertification.findFirst({
    where: {
      id: certId,
      companyId: company.id,
    },
    select: {
      id: true,
    },
  });

  if (!certification) {
    return NextResponse.json(
      { error: "Nie znaleziono certyfikatu." },
      { status: 404 },
    );
  }

  try {
    await prisma.companyCertification.delete({
      where: { id: certId },
    });

    revalidateTag("companies");

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    console.error("Delete certification error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć certyfikatu." },
      { status: 500 },
    );
  }
}

