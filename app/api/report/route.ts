import type { Prisma } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { revalidateTag } from "@/lib/cache";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ensureUserRecord } from "@/lib/services/user";

const reportSchema = z
  .object({
    companyId: z.string().cuid().optional(),
    planId: z.string().cuid().optional(),
    category: z.string().min(2).max(100),
    description: z.string().min(10).max(2000),
    email: z.string().email().max(160).optional(),
    source: z.string().max(80).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .refine(
    (value) => Boolean(value.companyId || value.planId),
    "Wymagane jest wskazanie firmy lub planu.",
  );

export async function POST(request: Request) {
  const identifier = getClientIp(request) ?? "anonymous";
  const limitResult = rateLimit({
    key: `report:${identifier}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!limitResult.success) {
    const retryAfterSeconds = Math.max(1, Math.ceil(limitResult.retryAfterMs / 1000));
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": `${retryAfterSeconds}`,
        },
      },
    );
  }

  const body = await request.json().catch(() => null);

  const parsed = reportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Niepoprawne dane zgloszenia." },
      { status: 422 },
    );
  }

  const { companyId, planId, category, description, email, source, metadata } =
    parsed.data;

  const { userId } = await auth();
  let internalUserId: string | null = null;

  if (userId) {
    const user = await currentUser();
    if (user) {
      const ensured = await ensureUserRecord({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        displayName: user.fullName ?? null,
      });
      internalUserId = ensured.id;
    }
  }

  let resolvedCompanyId = companyId ?? null;

  if (planId && !resolvedCompanyId) {
    const plan = await prisma.companyPlan.findUnique({
      where: { id: planId },
      select: { companyId: true },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan nie istnieje." },
        { status: 404 },
      );
    }

    resolvedCompanyId = plan.companyId;
  }

  if (!resolvedCompanyId) {
    return NextResponse.json(
      { error: "Nie udalo sie ustalic powiazanej firmy." },
      { status: 400 },
    );
  }

  if (planId) {
    const plan = await prisma.companyPlan.findUnique({
      where: { id: planId },
      select: { companyId: true },
    });

    if (!plan || plan.companyId !== resolvedCompanyId) {
      return NextResponse.json(
        { error: "Plan nie jest powiazany z wybrana firma." },
        { status: 400 },
      );
    }
  }

  const report = await prisma.dataIssueReport.create({
    data: {
      companyId: resolvedCompanyId,
      planId: planId ?? null,
      userId: internalUserId,
      email: email ?? null,
      category,
      description,
      status: "PENDING",
      source: source ?? "company_detail",
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
    },
  });

  try {
    revalidateTag("admin-data-issues");
    revalidatePath("/admin");
  } catch (error) {
    console.warn("[report] Failed to revalidate admin data issue cache", error);
  }

  return NextResponse.json({ id: report.id }, { status: 201 });
}

function getClientIp(request: Request) {
  const forwarded =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "";

  if (!forwarded) {
    return null;
  }

  return forwarded.split(",")[0]?.trim() ?? null;
}
