import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ensureUserRecord } from "@/lib/services/user";

const toggleSchema = z.object({
  companySlug: z.string().min(1),
});

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = toggleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { companySlug } = parsed.data;

  try {
  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json({ error: "COMPANY_NOT_FOUND" }, { status: 404 });
  }

  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const userRecord = await ensureUserRecord({
    clerkId: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    displayName: user.fullName ?? null,
  });

  const existingFavorite = await prisma.favorite.findFirst({
    where: {
      userId: userRecord.id,
      companyId: company.id,
    },
    select: {
      id: true,
    },
  });

  if (existingFavorite) {
    await prisma.favorite.delete({
      where: { id: existingFavorite.id },
    });

    return NextResponse.json({ status: "removed" } as const, { status: 200 });
  }

  await prisma.favorite.create({
    data: {
      userId: userRecord.id,
      companyId: company.id,
    },
  });

  return NextResponse.json({ status: "added" } as const, { status: 200 });
  } catch (error) {
    console.error("Favorite toggle error:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 },
    );
  }
}
