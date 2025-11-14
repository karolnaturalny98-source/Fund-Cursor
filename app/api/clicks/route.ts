import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ensureUserRecord } from "@/lib/services/user";
import { rateLimit } from "@/lib/rate-limit";

const clickSchema = z.object({
  companySlug: z.string().min(1),
  source: z.string().max(60).optional(),
});

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

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);
  const limitResult = rateLimit({
    key: `clicks:${ipAddress ?? "anonymous"}`,
    limit: 40,
    windowMs: 60 * 1000,
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

  const body = await request.json();
  const parsed = clickSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Blad walidacji." }, { status: 400 });
  }

  const { companySlug, source } = parsed.data;
  const userAgent = request.headers.get("user-agent") ?? "";

  const { userId } = await auth();

  if (userId) {
    const user = await currentUser();

    if (user) {
      await ensureUserRecord({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        displayName: user.fullName ?? null,
      });
    }
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Nie znaleziono firmy o podanym slugu." },
        { status: 404 },
      );
    }

    await prisma.clickEvent.create({
      data: {
        companyId: company.id,
        userId: userId ?? null,
        ipAddress: ipAddress ?? null,
        userAgent,
        source: source ?? null,
      },
    });

    return NextResponse.json({ status: "logged" }, { status: 201 });
  } catch (error) {
    console.error("Click logging error:", error);
    return NextResponse.json(
      { error: "Nie udalo sie zarejestrowac klikniecia." },
      { status: 500 },
    );
  }
}
