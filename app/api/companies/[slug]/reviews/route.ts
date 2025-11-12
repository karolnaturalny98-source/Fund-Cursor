import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ensureUserRecord } from "@/lib/services/user";

const EXPERIENCE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "professional",
] as const;

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z
    .string()
    .trim()
    .min(40, "Opinia powinna zawierać przynajmniej 40 znaków.")
    .max(2000, "Opinia może mieć maksymalnie 2000 znaków."),
  pros: z
    .array(
      z
        .string()
        .trim()
        .min(2, "Zaleta powinna mieć przynajmniej 2 znaki.")
        .max(120, "Zaleta może mieć maksymalnie 120 znaków."),
    )
    .max(6)
    .optional()
    .default([]),
  cons: z
    .array(
      z
        .string()
        .trim()
        .min(2, "Wada powinna mieć przynajmniej 2 znaki.")
        .max(120, "Wada może mieć maksymalnie 120 znaków."),
    )
    .max(6)
    .optional()
    .default([]),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional().default("intermediate"),
  tradingStyle: z
    .string()
    .trim()
    .max(60, "Styl handlu może mieć maksymalnie 60 znaków.")
    .optional()
    .default(""),
  timeframe: z
    .string()
    .trim()
    .max(40, "Preferowany interwał może mieć maksymalnie 40 znaków.")
    .optional()
    .default(""),
  monthsWithCompany: z
    .number()
    .int()
    .min(0, "Podaj liczbę miesięcy większą lub równą 0.")
    .max(240, "Podaj liczbę miesięcy mniejszą niż 240.")
    .optional()
    .nullable()
    .default(null),
  accountSize: z
    .string()
    .trim()
    .max(80, "Rozmiar konta może mieć maksymalnie 80 znaków.")
    .optional()
    .default(""),
  recommended: z.boolean().optional().default(true),
  influencerDisclosure: z
    .string()
    .trim()
    .max(200, "Sekcja ujawnienia może mieć maksymalnie 200 znaków.")
    .optional()
    .default(""),
  resourceLinks: z
    .array(z.string().url("Podaj poprawny adres URL."))
    .max(3)
    .optional()
    .default([]),
});

type ReviewPayload = z.infer<typeof reviewSchema>;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { slug } = await params;
  const json = await request.json().catch(() => null);

  const parsed = reviewSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = sanitizePayload(parsed.data);

  const [company, userRecord] = await Promise.all([
    prisma.company.findUnique({
      where: { slug },
      select: { id: true },
    }),
    ensureUserRecord({
      clerkId: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      displayName: user.fullName ?? user.username ?? null,
    }),
  ]);

  if (!company) {
    return NextResponse.json({ error: "COMPANY_NOT_FOUND" }, { status: 404 });
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      companyId: company.id,
      userId: userRecord.id,
      status: {
        in: ["PENDING", "APPROVED"],
      },
    },
    select: { id: true, status: true },
  });

  if (existingReview) {
    return NextResponse.json(
      {
        error: "REVIEW_EXISTS",
        status: existingReview.status,
      },
      { status: 409 },
    );
  }

  await prisma.review.create({
    data: {
      companyId: company.id,
      userId: userRecord.id,
      rating: payload.rating,
      body: payload.body,
      pros: payload.pros,
      cons: payload.cons,
      metadata: buildMetadata(payload),
    },
  });

  try {
    revalidatePath(`/firmy/${slug}`);
  } catch (error) {
    console.warn("[reviews] revalidate failed", error);
  }

  return NextResponse.json({ status: "PENDING" }, { status: 201 });
}

function sanitizePayload(payload: ReviewPayload): ReviewPayload {
  const pros = payload.pros
    .map((item) => item.trim())
    .filter((item, index, all) => item.length > 0 && all.indexOf(item) === index);
  const cons = payload.cons
    .map((item) => item.trim())
    .filter((item, index, all) => item.length > 0 && all.indexOf(item) === index);

  return {
    ...payload,
    pros,
    cons,
    tradingStyle: payload.tradingStyle.trim(),
    timeframe: payload.timeframe.trim(),
    accountSize: payload.accountSize.trim(),
    influencerDisclosure: payload.influencerDisclosure.trim(),
    resourceLinks: payload.resourceLinks.filter((link, index, all) =>
      link.length > 0 && all.indexOf(link) === index,
    ),
  };
}

function buildMetadata(payload: ReviewPayload) {
  return {
    experienceLevel: payload.experienceLevel ?? null,
    tradingStyle: payload.tradingStyle || null,
    timeframe: payload.timeframe || null,
    monthsWithCompany: payload.monthsWithCompany ?? null,
    accountSize: payload.accountSize || null,
    recommended: payload.recommended ?? null,
    influencerDisclosure: payload.influencerDisclosure || null,
    resourceLinks: payload.resourceLinks ?? [],
  };
}
