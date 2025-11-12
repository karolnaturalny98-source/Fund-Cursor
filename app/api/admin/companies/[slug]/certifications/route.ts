import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const urlField = z.string().url().or(z.literal(""));

const createCertificationSchema = z.object({
  name: z.string().min(2).max(200),
  issuer: z.string().max(200).nullish(),
  description: z.string().max(1000).nullish(),
  url: urlField.nullish(),
  imageUrl: urlField.nullish(),
  issuedDate: z.string().datetime().nullish(),
  expiryDate: z.string().datetime().nullish(),
});

interface CertificationRouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: CertificationRouteParams) {
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

  const certifications = await prisma.companyCertification.findMany({
    where: { companyId: company.id },
    orderBy: {
      issuedDate: "desc",
    },
  });

  return NextResponse.json({ data: certifications });
}

export async function POST(request: Request, { params }: CertificationRouteParams) {
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
  const parsed = createCertificationSchema.safeParse(json);

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
    const certification = await prisma.companyCertification.create({
      data: {
        companyId: company.id,
        name: data.name,
        issuer: data.issuer ?? null,
        description: data.description ?? null,
        url: data.url ?? null,
        imageUrl: data.imageUrl ?? null,
        issuedDate: data.issuedDate ? new Date(data.issuedDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });

    revalidateTag("companies");

    return NextResponse.json({ data: certification }, { status: 201 });
  } catch (error) {
    console.error("Create certification error:", error);
    return NextResponse.json(
      { error: "Nie udało się dodać certyfikatu." },
      { status: 500 },
    );
  }
}

