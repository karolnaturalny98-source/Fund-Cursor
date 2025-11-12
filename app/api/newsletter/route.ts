import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

