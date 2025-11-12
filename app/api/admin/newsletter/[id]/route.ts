import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Usunięcie subskrybenta
    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Subskrybent został usunięty" });
  } catch (error) {
    console.error("Newsletter delete error:", error);
    return NextResponse.json(
      { error: "Błąd podczas usuwania subskrybenta" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["active", "unsubscribed"].includes(status)) {
      return NextResponse.json(
        { error: "Nieprawidłowy status" },
        { status: 400 }
      );
    }

    // Aktualizacja statusu
    const updated = await prisma.newsletterSubscriber.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      message: "Status zaktualizowany",
      subscriber: updated,
    });
  } catch (error) {
    console.error("Newsletter update error:", error);
    return NextResponse.json(
      { error: "Błąd podczas aktualizacji" },
      { status: 500 }
    );
  }
}

