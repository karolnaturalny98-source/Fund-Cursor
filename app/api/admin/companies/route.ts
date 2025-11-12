import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const urlField = z.string().url().or(z.literal(""));

const createCompanySchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki."),
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

export async function POST(request: Request) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const json = await request.json();
  const parsed = createCompanySchema.safeParse(json);

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
    const company = await prisma.company.create({
      data: {
        name: data.name,
        slug: data.slug,
        headline: data.headline ?? null,
        logoUrl: data.logoUrl ?? null,
        shortDescription: data.shortDescription ?? null,
        country: data.country ?? null,
        foundedYear: data.foundedYear ?? null,
        websiteUrl: data.websiteUrl ?? null,
        supportContact: data.supportContact ?? null,
        discountCode: data.discountCode ?? null,
        cashbackRate: data.cashbackRate ?? null,
        payoutFrequency: data.payoutFrequency ?? null,
        highlights: data.highlights ?? [],
        regulation: data.regulation ?? null,
        socials: data.socials ?? undefined,
        kycRequired: data.kycRequired ?? false,
        paymentMethods: data.paymentMethods ?? [],
        instruments: data.instruments ?? [],
        platforms: data.platforms ?? [],
        educationLinks: data.educationLinks ?? [],
        ceo: data.ceo ?? null,
        legalName: data.legalName ?? null,
        headquartersAddress: data.headquartersAddress ?? null,
        foundersInfo: data.foundersInfo ?? null,
        verificationStatus: data.verificationStatus ?? null,
        licenses: data.licenses ?? [],
        registryLinks: data.registryLinks ?? [],
        registryData: data.registryData ?? null,
      },
    });

    return NextResponse.json({ data: company }, { status: 201 });
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

    console.error("Create company error:", error);
    return NextResponse.json(
      { error: "Nie udało się zapisać firmy." },
      { status: 500 },
    );
  }
}
