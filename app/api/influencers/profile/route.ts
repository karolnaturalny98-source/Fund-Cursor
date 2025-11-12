import { Prisma } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getInfluencerProfileForUser } from "@/lib/queries/influencers";
import { prisma } from "@/lib/prisma";
import { ensureUserRecord } from "@/lib/services/user";

const profileSchema = z.object({
  platform: z
    .string()
    .trim()
    .min(2, "Podaj nazwę platformy.")
    .max(60, "Nazwa platformy może mieć maksymalnie 60 znaków."),
  handle: z
    .string()
    .trim()
    .min(2, "Podaj nazwę profilu.")
    .max(80, "Nazwa profilu może mieć maksymalnie 80 znaków."),
  audienceSize: z
    .union([
      z
        .number()
        .int()
        .min(0)
        .max(10000000),
      z
        .string()
        .trim()
        .regex(/^[0-9]*$/, "Podaj liczbę obserwujących."),
    ])
    .optional()
    .nullable()
    .default(null),
  bio: z
    .string()
    .trim()
    .max(500, "Opis może mieć maksymalnie 500 znaków.")
    .optional()
    .default(""),
  socialLinks: z
    .array(z.string().url("Podaj poprawny adres URL."))
    .max(5)
    .optional()
    .default([]),
  preferredCompanies: z
    .array(
      z
        .string()
        .trim()
        .min(2)
        .max(80),
    )
    .max(10)
    .optional()
    .default([]),
  contactEmail: z.string().email("Podaj poprawny adres email.").optional(),
});

type ProfilePayload = z.infer<typeof profileSchema>;

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const profile = await getInfluencerProfileForUser(user.id);
  return NextResponse.json({ data: profile });
}

export async function POST(request: Request) {
  return upsertProfile(request);
}

export async function PATCH(request: Request) {
  return upsertProfile(request);
}

async function upsertProfile(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const normalized = normalizeProfileInput(parsed.data);

  const userRecord = await ensureUserRecord({
    clerkId: user.id,
    email: user.emailAddresses?.[0]?.emailAddress,
    displayName: user.fullName ?? user.username ?? null,
  });

  const currentProfile = await prisma.influencerProfile.findUnique({
    where: { userId: userRecord.id },
  });

  const nextStatus = currentProfile?.status === "APPROVED" ? "APPROVED" : "PENDING";

  if (currentProfile) {
    const metadataValue = Object.keys(normalized.metadata).length
      ? (normalized.metadata as Prisma.InputJsonValue)
      : Prisma.JsonNull;

    await prisma.influencerProfile.update({
      where: { id: currentProfile.id },
      data: {
        platform: normalized.platform,
        handle: normalized.handle,
        audienceSize: normalized.audienceSize,
        bio: normalized.bio,
        socialLinks: normalized.socialLinks,
        preferredCompanies: normalized.preferredCompanies,
        metadata: metadataValue,
        status: nextStatus,
      },
    });
  } else {
    const metadataValue = Object.keys(normalized.metadata).length
      ? (normalized.metadata as Prisma.InputJsonValue)
      : Prisma.JsonNull;

    await prisma.influencerProfile.create({
      data: {
        userId: userRecord.id,
        platform: normalized.platform,
        handle: normalized.handle,
        audienceSize: normalized.audienceSize,
        bio: normalized.bio,
        socialLinks: normalized.socialLinks,
        preferredCompanies: normalized.preferredCompanies,
        metadata: metadataValue,
        status: "PENDING",
      },
    });
  }

  try {
    revalidatePath("/admin");
  } catch (error) {
    console.warn("[influencers/profile] revalidate failed", error);
  }

  const profile = await getInfluencerProfileForUser(user.id);
  return NextResponse.json({ data: profile });
}

function normalizeProfileInput(input: ProfilePayload) {
  const audienceSize = normalizeAudience(input.audienceSize);
  const socialLinks = Array.from(
    new Set(
      input.socialLinks
        .map((link) => link.trim())
        .filter((link) => link.length > 0),
    ),
  );
  const preferredCompanies = Array.from(
    new Set(
      input.preferredCompanies
        .map((slug) => slug.trim().toLowerCase())
        .filter((slug) => slug.length > 0),
    ),
  );

  return {
    platform: input.platform.trim(),
    handle: input.handle.trim(),
    audienceSize,
    bio: input.bio ? input.bio.trim() : null,
    socialLinks,
    preferredCompanies,
    metadata: buildMetadata({ contactEmail: input.contactEmail ?? null }),
  };
}

function normalizeAudience(value: ProfilePayload["audienceSize"]) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return Math.max(0, Math.min(parsed, 10000000));
}

function buildMetadata(metadata: { contactEmail: string | null }) {
  const result: Record<string, unknown> = {};

  if (metadata.contactEmail) {
    result.contactEmail = metadata.contactEmail;
  }

  return result;
}
