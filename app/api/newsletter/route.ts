import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NEWSLETTER_LIMIT = {
  windowMs: 10 * 60 * 1000,
  max: 5,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source } = body;

    // Walidacja emaila
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email jest wymagany" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Nieprawidłowy format emaila" },
        { status: 400 }
      );
    }

    const identifier = `${getClientIp(request) ?? "unknown"}:${trimmedEmail}`;
    const limitResult = rateLimit({
      key: `newsletter:${identifier}`,
      limit: NEWSLETTER_LIMIT.max,
      windowMs: NEWSLETTER_LIMIT.windowMs,
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

    // Sprawdzenie czy email już istnieje
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          { error: "Ten email jest już zapisany do newslettera" },
          { status: 409 }
        );
      } else {
        // Reaktywacja subskrypcji
        await prisma.newsletterSubscriber.update({
          where: { email: trimmedEmail },
          data: {
            status: "active",
            subscribedAt: new Date(),
          },
        });

        return NextResponse.json(
          { message: "Twoja subskrypcja została reaktywowana" },
          { status: 200 }
        );
      }
    }

    // Utworzenie nowego subskrybenta
    await prisma.newsletterSubscriber.create({
      data: {
        email: trimmedEmail,
        source: source || "footer",
        status: "active",
      },
    });

    return NextResponse.json(
      { message: "Dziękujemy za zapisanie się do newslettera!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas zapisywania. Spróbuj ponownie później." },
      { status: 500 }
    );
  }
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
