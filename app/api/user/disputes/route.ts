import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "@/lib/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  createDisputeCase,
  getUserDisputes,
} from "@/lib/queries/disputes";
import type { DisputeStatus } from "@/lib/types";
import { ensureUserRecord } from "@/lib/services/user";

export const disputeStatusEnum = z.enum([
  "OPEN",
  "IN_REVIEW",
  "WAITING_USER",
  "RESOLVED",
  "REJECTED",
] as const);

const createSchema = z
  .object({
    companyId: z.string().cuid(),
    planId: z.string().cuid().optional(),
    title: z.string().min(5).max(160),
    category: z.string().min(2).max(80),
    description: z.string().min(20).max(4000),
    requestedAmount: z.number().min(0).max(1_000_000).optional(),
    requestedCurrency: z
      .string()
      .transform((value) => value.toUpperCase())
      .refine((value) => /^[A-Z]{3}$/.test(value), {
        message: "Waluta powinna miec kod ISO (np. USD).",
      })
      .optional(),
    evidenceLinks: z
      .array(z.string().url().max(1024))
      .max(10)
      .optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
;

export function parseStatus(value: string | null): DisputeStatus | null {
  if (!value) {
    return null;
  }

  const parsed = disputeStatusEnum.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }

  return null;
}

function parseLimit(value: string | null, fallback: number, max: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1), max);
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const limit = parseLimit(searchParams.get("limit"), 20, 50);
  const cursor = searchParams.get("cursor");
  const status = parseStatus(searchParams.get("status"));

  const result = await getUserDisputes(userId, {
    limit,
    cursor,
    status,
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Niepoprawne dane zgloszenia.", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;

  const ensuredUser = await ensureUserRecord({
    clerkId: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    displayName: user.fullName ?? null,
  });

  const companyRecord = await prisma.company.findUnique({
    where: { id: data.companyId },
    select: { id: true },
  });

  if (!companyRecord) {
    return NextResponse.json(
      { error: "Wybrana firma nie istnieje." },
      { status: 404 },
    );
  }

  let planRecord: { companyId: string } | null = null;

  if (data.planId) {
    planRecord = await prisma.companyPlan.findUnique({
      where: { id: data.planId },
      select: { companyId: true },
    });

    if (!planRecord) {
      return NextResponse.json(
        { error: "Wybrany plan nie istnieje." },
        { status: 404 },
      );
    }

    if (planRecord.companyId !== data.companyId) {
      return NextResponse.json(
        { error: "Plan nie jest powiazany z wybrana firma." },
        { status: 400 },
      );
    }
  }

  const dispute = await createDisputeCase({
    userId: ensuredUser.id,
    companyId: data.companyId,
    planId: data.planId ?? null,
    title: data.title,
    category: data.category,
    description: data.description,
    requestedAmount: data.requestedAmount ?? null,
    requestedCurrency: data.requestedCurrency ?? null,
    evidenceLinks: data.evidenceLinks ?? [],
    metadata: data.metadata ?? null,
  });

  try {
    revalidateTag("admin-disputes");
    revalidateTag(`user-disputes-${user.id}`);
  } catch (error) {
    console.warn("[disputes:user] failed to revalidate cache", error);
  }

  return NextResponse.json(dispute, { status: 201 });
}




