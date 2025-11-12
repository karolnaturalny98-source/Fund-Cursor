import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const urlField = z.string().url().or(z.literal(""));

const updateCompanySchema = z.object({
  name: z.string().min(2).max(120).optional(),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki.")
    .optional(),
  headline: z.string().max(160).nullish(),
  logoUrl: urlField.nullish(),
  shortDescription: z.string().max(220).nullish(),
  country: z.string().max(120).nullish(),
  foundedYear: z.number().int().min(2000).max(2100).nullish(),
  websiteUrl: urlField.nullish(),
  supportContact: z.string().max(180).nullish(),
  discountCode: z.string().max(50).nullish(),
  cashbackRate: z.number().int().min(0).max(100).nullish(),
  payoutFrequency: z.string().max(120).nullish(),
  highlights: z.array(z.string().max(160)).max(12).optional(),
  regulation: z.string().max(160).nullish(),
  socials: z.record(z.string(), z.string()).nullish(),
  kycRequired: z.boolean().optional(),
  paymentMethods: z.array(z.string().max(120)).max(12).optional(),
  instruments: z.array(z.string().max(120)).max(12).optional(),
  platforms: z.array(z.string().max(120)).max(12).optional(),
  educationLinks: z.array(z.string().max(220)).max(12).optional(),
  ceo: z.string().max(120).nullish(),
  legalName: z.string().max(200).nullish(),
  headquartersAddress: z.string().max(300).nullish(),
  foundersInfo: z.string().max(500).nullish(),
  verificationStatus: z.enum(["VERIFIED", "PENDING", "UNVERIFIED"]).nullish(),
  licenses: z.array(z.string().max(200)).max(20).optional(),
  registryLinks: z.array(urlField).max(10).optional(),
  registryData: z.string().max(300).nullish(),
});

interface CompanyRouteParams {
  params: Promise<{ slug: string }>;
}

export async function PATCH(request: Request, { params }: CompanyRouteParams) {
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

  const json = await request.json();
  const parsed = updateCompanySchema.safeParse(json);

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

  // Build update object with only provided fields
  const updateData: Prisma.CompanyUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.headline !== undefined) updateData.headline = data.headline ?? null;
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl ?? null;
  if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription ?? null;
  if (data.country !== undefined) updateData.country = data.country ?? null;
  if (data.foundedYear !== undefined) updateData.foundedYear = data.foundedYear ?? null;
  if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl ?? null;
  if (data.supportContact !== undefined) updateData.supportContact = data.supportContact ?? null;
  if (data.discountCode !== undefined) updateData.discountCode = data.discountCode ?? null;
  if (data.cashbackRate !== undefined) updateData.cashbackRate = data.cashbackRate ?? null;
  if (data.payoutFrequency !== undefined) updateData.payoutFrequency = data.payoutFrequency ?? null;
  if (data.highlights !== undefined) updateData.highlights = data.highlights ?? [];
  if (data.regulation !== undefined) updateData.regulation = data.regulation ?? null;
  if (data.socials !== undefined) updateData.socials = data.socials ?? undefined;
  if (data.kycRequired !== undefined) updateData.kycRequired = data.kycRequired;
  if (data.paymentMethods !== undefined) updateData.paymentMethods = data.paymentMethods ?? [];
  if (data.instruments !== undefined) updateData.instruments = data.instruments ?? [];
  if (data.platforms !== undefined) updateData.platforms = data.platforms ?? [];
  if (data.educationLinks !== undefined) updateData.educationLinks = data.educationLinks ?? [];
  if (data.ceo !== undefined) updateData.ceo = data.ceo ?? null;
  if (data.legalName !== undefined) updateData.legalName = data.legalName ?? null;
  if (data.headquartersAddress !== undefined) updateData.headquartersAddress = data.headquartersAddress ?? null;
  if (data.foundersInfo !== undefined) updateData.foundersInfo = data.foundersInfo ?? null;
  if (data.verificationStatus !== undefined) updateData.verificationStatus = data.verificationStatus ?? null;
  if (data.licenses !== undefined) updateData.licenses = data.licenses ?? [];
  if (data.registryLinks !== undefined) updateData.registryLinks = data.registryLinks ?? [];
  if (data.registryData !== undefined) updateData.registryData = data.registryData ?? null;

  try {
    const company = await prisma.company.update({
      where: { slug },
      data: updateData,
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/firmy");
      revalidatePath(`/firmy/${company.slug}`);
    } catch (revalidateError) {
      console.warn("[admin/companies] revalidate failed", revalidateError);
    }

    return NextResponse.json({ data: company });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Firma o takim slugu już istnieje." },
        { status: 409 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Nie znaleziono firmy o podanym slugu." },
        { status: 404 },
      );
    }

    console.error("Update company error:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować firmy." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: CompanyRouteParams) {
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

  try {
    // Check if company has approved or redeemed cashback transactions
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        transactions: {
          where: {
            status: {
              in: ["APPROVED", "REDEEMED"],
            },
          },
          take: 1,
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Nie znaleziono firmy o podanym slugu." },
        { status: 404 },
      );
    }

    if (company.transactions.length > 0) {
      return NextResponse.json(
        { 
          error: "Nie można usunąć firmy z zatwierdzonymi lub zrealizowanymi transakcjami cashback. Przenieś transakcje lub zmień ich status przed usunięciem." 
        },
        { status: 409 },
      );
    }

    await prisma.company.delete({
      where: { slug },
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/firmy");
    } catch (revalidateError) {
      console.warn("[admin/companies] revalidate failed", revalidateError);
    }

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    console.error("Delete company error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć firmy." },
      { status: 500 },
    );
  }
}

