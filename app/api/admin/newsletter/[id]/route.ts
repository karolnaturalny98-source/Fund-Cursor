import { NextRequest, NextResponse } from "next/server";

import { assertAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "@/lib/cache";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await assertAdminRequest();

    const { id } = await context.params;

    // Usunięcie subskrybenta
    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    try {
      revalidateTag("admin-newsletter");
    } catch (error) {
      console.warn("[admin-newsletter] Failed to revalidate after delete", error);
    }

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
    await assertAdminRequest();

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

    try {
      revalidateTag("admin-newsletter");
    } catch (error) {
      console.warn("[admin-newsletter] Failed to revalidate after patch", error);
    }

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
