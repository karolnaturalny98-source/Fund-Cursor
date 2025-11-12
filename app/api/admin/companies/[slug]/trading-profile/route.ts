import { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  instrumentGroups: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        description: z.string().max(200).nullable().optional(),
        instruments: z.array(z.string().min(1).max(120)).max(20),
      }),
    )
    .max(12)
    .optional(),
  leverageTiers: z
    .array(
      z.object({
        label: z.string().min(1).max(120),
        accountSize: z.string().max(80).nullable().optional(),
        maxLeverage: z.number().positive().nullable().optional(),
        notes: z.string().max(200).nullable().optional(),
      }),
    )
    .max(12)
    .optional(),
  tradingCommissions: z
    .array(
      z.object({
        market: z.string().min(1).max(120),
        value: z.string().min(1).max(120),
        notes: z.string().max(200).nullable().optional(),
      }),
    )
    .max(20)
    .optional(),
  firmRules: z
    .object({
      allowed: z.array(z.string().min(1).max(140)).max(40).optional(),
      restricted: z.array(z.string().min(1).max(140)).max(40).optional(),
    })
    .optional(),
});

interface TradingProfileRouteParams {
  params: Promise<{ slug: string }>;
}

export async function PUT(request: Request, { params }: TradingProfileRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      {
        error: message === "FORBIDDEN" ? "Permission denied." : "Authentication required.",
      },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug } = await params;
  const body = await request.json().catch(() => null);

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid payload.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  const updateData: Prisma.CompanyUpdateInput = {};

  if (payload.instrumentGroups !== undefined) {
    updateData.instrumentGroups = payload.instrumentGroups
      .map((group) => ({
    title: group.title.trim(),
    description: group.description ? group.description.trim() : null,
    instruments: group.instruments.map((item) => item.trim()).filter(Boolean),
      }))
      .filter((group) => group.title.length);
  }

  if (payload.leverageTiers !== undefined) {
    updateData.leverageTiers = payload.leverageTiers
      .map((tier) => ({
    label: tier.label.trim(),
    accountSize: tier.accountSize ? tier.accountSize.trim() : null,
    maxLeverage: tier.maxLeverage ?? null,
    notes: tier.notes ? tier.notes.trim() : null,
      }))
      .filter((tier) => tier.label.length);
  }

  if (payload.tradingCommissions !== undefined) {
    updateData.tradingCommissions = payload.tradingCommissions
      .map((commission) => ({
    market: commission.market.trim(),
    value: commission.value.trim(),
    notes: commission.notes ? commission.notes.trim() : null,
      }))
      .filter((commission) => commission.market.length && commission.value.length);
  }

  if (payload.firmRules !== undefined) {
    updateData.firmRules = {
      allowed: (payload.firmRules.allowed ?? []).map((rule) => rule.trim()).filter(Boolean),
      restricted: (payload.firmRules.restricted ?? []).map((rule) => rule.trim()).filter(Boolean),
  };
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No changes provided." }, { status: 400 });
  }

  try {
    await prisma.company.update({
      where: { slug },
      data: updateData,
    });

    revalidateTag("companies");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Trading profile update error:", error);
    return NextResponse.json({ error: "Could not save trading profile." }, { status: 500 });
  }
}
