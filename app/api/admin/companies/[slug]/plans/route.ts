import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const optionalUrl = z.string().url().or(z.literal(""));

const createPlanSchema = z.object({
  name: z.string().min(2).max(120),
  price: z.number().positive(),
  currency: z.string().min(1).max(10),
  profitSplit: z.string().max(20).nullish(),
  evaluationModel: z.enum(["one-step", "two-step", "instant-funding"]),
  description: z.string().max(260).nullish(),
  features: z.array(z.string().max(120)).max(12).optional(),
  maxDrawdown: z.number().min(0).nullish(),
  maxDailyLoss: z.number().min(0).nullish(),
  profitTarget: z.number().min(0).nullish(),
  minTradingDays: z.number().int().min(0).nullish(),
  payoutFirstAfterDays: z.number().int().min(0).nullish(),
  payoutCycleDays: z.number().int().min(0).nullish(),
  leverage: z.number().int().min(0).nullish(),
  accountType: z.string().max(40).nullish(),
  affiliateUrl: optionalUrl.nullish(),
  affiliateCommission: z.number().min(0).max(100).nullish(),
  notes: z.string().max(260).nullish(),
  trailingDrawdown: z.boolean().optional(),
  refundableFee: z.boolean().optional(),
  scalingPlan: z.boolean().optional(),
});

interface PlanRouteProps {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, { params }: PlanRouteProps) {
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
  const parsed = createPlanSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Błąd walidacji.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  try {
    const plan = await prisma.companyPlan.create({
      data: {
        name: payload.name,
        price: payload.price,
        currency: payload.currency.toUpperCase(),
        profitSplit: payload.profitSplit ?? null,
        evaluationModel: payload.evaluationModel,
        description: payload.description ?? null,
        features: payload.features ?? [],
        maxDrawdown: payload.maxDrawdown ?? null,
        maxDailyLoss: payload.maxDailyLoss ?? null,
        profitTarget: payload.profitTarget ?? null,
        minTradingDays: payload.minTradingDays ?? null,
        payoutFirstAfterDays: payload.payoutFirstAfterDays ?? null,
        payoutCycleDays: payload.payoutCycleDays ?? null,
        leverage: payload.leverage ?? null,
        accountType: payload.accountType ?? null,
        affiliateUrl: payload.affiliateUrl ?? null,
        affiliateCommission: payload.affiliateCommission ? new Prisma.Decimal(payload.affiliateCommission) : null,
        notes: payload.notes ?? null,
        trailingDrawdown: payload.trailingDrawdown ?? false,
        refundableFee: payload.refundableFee ?? false,
        scalingPlan: payload.scalingPlan ?? false,
        priceHistory: {
          create: {
            price: payload.price,
            currency: payload.currency.toUpperCase(),
          },
        },
        company: {
          connect: { slug },
        },
      },
    });

    return NextResponse.json({ data: plan }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Nie znaleziono firmy o podanym slugu." },
        { status: 404 },
      );
    }

    console.error("Create plan error:", error);
    return NextResponse.json(
      { error: "Nie udało się zapisać planu." },
      { status: 500 },
    );
  }
}
