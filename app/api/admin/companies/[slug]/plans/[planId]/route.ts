import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const optionalUrl = z.string().url().or(z.literal(""));

const updatePlanSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  price: z.number().positive().optional(),
  currency: z.string().min(1).max(10).optional(),
  profitSplit: z.string().max(20).nullish(),
  evaluationModel: z.enum(["one-step", "two-step", "instant-funding"]).optional(),
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

interface PlanRouteParams {
  params: Promise<{ slug: string; planId: string }>;
}

export async function PATCH(request: Request, { params }: PlanRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug, planId } = await params;

  const json = await request.json();
  const parsed = updatePlanSchema.safeParse(json);

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
    // Verify plan belongs to the company
    const existingPlan = await prisma.companyPlan.findFirst({
      where: {
        id: planId,
        company: {
          slug,
        },
      },
      select: {
        id: true,
        price: true,
        currency: true,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Nie znaleziono planu dla tej firmy." },
        { status: 404 },
      );
    }

    // Build update object
    const updateData: Prisma.CompanyPlanUpdateInput = {};

    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.price !== undefined) updateData.price = payload.price;
    if (payload.currency !== undefined) updateData.currency = payload.currency.toUpperCase();
    if (payload.profitSplit !== undefined) updateData.profitSplit = payload.profitSplit ?? null;
    if (payload.evaluationModel !== undefined) updateData.evaluationModel = payload.evaluationModel;
    if (payload.description !== undefined) updateData.description = payload.description ?? null;
    if (payload.features !== undefined) updateData.features = payload.features ?? [];
    if (payload.maxDrawdown !== undefined) updateData.maxDrawdown = payload.maxDrawdown ?? null;
    if (payload.maxDailyLoss !== undefined) updateData.maxDailyLoss = payload.maxDailyLoss ?? null;
    if (payload.profitTarget !== undefined) updateData.profitTarget = payload.profitTarget ?? null;
    if (payload.minTradingDays !== undefined) updateData.minTradingDays = payload.minTradingDays ?? null;
    if (payload.payoutFirstAfterDays !== undefined) updateData.payoutFirstAfterDays = payload.payoutFirstAfterDays ?? null;
    if (payload.payoutCycleDays !== undefined) updateData.payoutCycleDays = payload.payoutCycleDays ?? null;
    if (payload.leverage !== undefined) updateData.leverage = payload.leverage ?? null;
    if (payload.accountType !== undefined) updateData.accountType = payload.accountType ?? null;
    if (payload.affiliateUrl !== undefined) updateData.affiliateUrl = payload.affiliateUrl ?? null;
    if (payload.affiliateCommission !== undefined) updateData.affiliateCommission = payload.affiliateCommission ? new Prisma.Decimal(payload.affiliateCommission) : null;
    if (payload.notes !== undefined) updateData.notes = payload.notes ?? null;
    if (payload.trailingDrawdown !== undefined) updateData.trailingDrawdown = payload.trailingDrawdown;
    if (payload.refundableFee !== undefined) updateData.refundableFee = payload.refundableFee;
    if (payload.scalingPlan !== undefined) updateData.scalingPlan = payload.scalingPlan;

    // If price changed, create price history entry
    const priceChanged = payload.price !== undefined && payload.price !== Number(existingPlan.price);
    const currencyChanged = payload.currency !== undefined && payload.currency.toUpperCase() !== existingPlan.currency;

    if (priceChanged || currencyChanged) {
      updateData.priceHistory = {
        create: {
          price: payload.price ?? existingPlan.price,
          currency: (payload.currency ?? existingPlan.currency).toUpperCase(),
        },
      };
    }

    const plan = await prisma.companyPlan.update({
      where: { id: planId },
      data: updateData,
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/firmy");
      revalidatePath(`/firmy/${slug}`);
    } catch (revalidateError) {
      console.warn("[admin/plans] revalidate failed", revalidateError);
    }

    return NextResponse.json({ data: plan });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Nie znaleziono planu." },
        { status: 404 },
      );
    }

    console.error("Update plan error:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować planu." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: PlanRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug, planId } = await params;

  try {
    // Verify plan belongs to the company and check for disputes
    const plan = await prisma.companyPlan.findFirst({
      where: {
        id: planId,
        company: {
          slug,
        },
      },
      include: {
        disputes: {
          where: {
            status: {
              in: ["OPEN", "IN_REVIEW", "WAITING_USER"],
            },
          },
          take: 1,
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Nie znaleziono planu dla tej firmy." },
        { status: 404 },
      );
    }

    if (plan.disputes.length > 0) {
      return NextResponse.json(
        { 
          error: "Nie można usunąć planu z aktywnymi sporami. Zamknij spory przed usunięciem planu." 
        },
        { status: 409 },
      );
    }

    await prisma.companyPlan.delete({
      where: { id: planId },
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/firmy");
      revalidatePath(`/firmy/${slug}`);
    } catch (revalidateError) {
      console.warn("[admin/plans] revalidate failed", revalidateError);
    }

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    console.error("Delete plan error:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć planu." },
      { status: 500 },
    );
  }
}

